// @ts-check
import '@agoric/zoe/exported';

import { makeIssuerKit, AssetKind, amountMath, AmountMath } from '@agoric/ertp';
import { Far } from '@agoric/marshal';
import { E } from '@agoric/eventual-send';
import buildManualTimer from '@agoric/zoe/tools/manualTimer';
import {
  assertProposalShape,
  defaultAcceptanceMsg,
} from '@agoric/zoe/src/contractSupport';
import { assertBidSeat } from '@agoric/zoe/src/contracts/auction/assertBidSeat';
import { calcWinnerAndClose } from '@agoric/zoe/src/contracts/auction/secondPriceLogic';

const trace = (label) => (value) => {
  console.log(`${label}::`, value);
  return value;
};

const auctionCountdownTracer = trace('Total elapsed time for auction');

/**
 * This contract mints non-fungible tokens (baseball cards) and creates a contract
 * instance to sell the cards in exchange for some sort of money.
 *
 * @type {ContractStartFn}
 */
const start = async (zcf) => {
  const { timeAuthority, closesAfter } = zcf.getTerms();
  const zoeService = await zcf.getZoeService();
  const bidSeats = [];
  let sellSeat;
  E(timeAuthority)
    .setWakeup(
      closesAfter,
      Far('wakeObj', {
        wake: () => calcWinnerAndClose(zcf, sellSeat, bidSeats),
      }),
    )
    .catch((err) => {
      console.error(
        `Could not schedule the close of the auction at the 'closesAfter' deadline ${closesAfter} using this timer ${timeAuthority}`,
      );
      console.error(err);
      throw err;
    });

  const makeBidInvitation = () => {
    /** @type {OfferHandler} */
    const performBid = (seat) => {
      assertProposalShape(seat, {
        give: { Bid: null },
        want: { Asset: null },
      });
      assertBidSeat(zcf, sellSeat, seat);
      bidSeats.push(seat);
      return defaultAcceptanceMsg;
    };

    const customProperties = harden({
      auctionedAssets: sellSeat.getProposal().give.Asset,
      minimumBid: sellSeat.getProposal().want.Ask,
      closesAfter,
      timeAuthority,
    });

    return zcf.makeInvitation(performBid, 'bid', customProperties);
  };

  const createAuction = async (
    itemKit,
    moneyIssuer,
    startAuctionInstallation,
    pricePerCard,
    itemAmount = 1000n,
  ) => {
    const { issuer: tgArtIssuer, brand: tgArtBrand, mint: tgArtMint } = itemKit;
    const itemForSaleAmout = AmountMath.make(tgArtBrand, 1n);
    const itemForSalePayment = tgArtMint.mintPayment(itemForSaleAmout);
    // Note that the proposal `want` is empty because we don't know
    // how many cards will be sold, so we don't know how much money we
    // will make in total.
    // https://github.com/Agoric/agoric-sdk/issues/855
    const proposal = harden({
      give: { Items: AmountMath.make(tgArtBrand, itemAmount) },
    });
    const paymentKeywordRecord = harden({ Items: itemForSalePayment });

    const issuerKeywordRecord = harden({
      Items: tgArtIssuer,
      Money: moneyIssuer,
    });

    const startAuctionTerms = harden({
      pricePerItem: pricePerCard,
    });
    const { creatorInvitation, creatorFacet, instance, publicFacet } = await E(
      zoeService,
    ).startInstance(
      startAuctionInstallation,
      issuerKeywordRecord,
      startAuctionTerms,
    );
    const startAuctionCreatorSeat = await E(zoeService).offer(
      creatorInvitation,
      proposal,
      paymentKeywordRecord,
    );

    return harden({
      startAuctionCreatorSeat,
      startAuctonCreatorFacet: creatorFacet,
      startAuctionInstance: instance,
      publicBidInvitation: makeBidInvitation,
    });
  };

  const creatorFacet = Far('Card store creator', {
    createAuction: () => zcf.makeInvitation(createAuction, 'Create Auction'),
  });

  return harden({
    creatorFacet,
    publicFacet: Far('Bid Inviation', {
      makeBid: () => zcf.makeInvitation(makeBidInvitation, 'Bid'),
    }),
  });
};
export { start };
