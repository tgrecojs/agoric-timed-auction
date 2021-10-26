// @ts-check
import '@agoric/zoe/exported';

import { makeIssuerKit, AssetKind, amountMath, AmountMath } from '@agoric/ertp';
import { Far } from '@agoric/marshal';
import { E } from '@agoric/eventual-send';
import buildManualTimer from '@agoric/zoe/tools/manualTimer';
import {
  assertProposalShape,
  assertIssuerKeywords,
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

const start = (zcf) => {
  const { timeAuthority, closesAfter } = zcf.getTerms();

  let sellSeat;
  const bidSeats = [];

  // seller will use 'Asset' and 'Ask'. buyer will use 'Asset' and 'Bid'
  assertIssuerKeywords(zcf, harden(['Asset', 'Ask']));

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
        give: { Ask: null },
        want: { Asset: null },
      });
      console.log({
        bidSeat: seat,
        bidSeatAllocation: seat.getCurrentAllocation(),
        sellSeat,
        sellSeatAllocation: sellSeat.getCurrentAllocation()
      });
      assertBidSeat(zcf, sellSeat, seat);
      console.log({ bidSeats, seat });
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

  const sellItem = (seat) => {
    assertProposalShape(seat, {
      give: { Asset: null },
      want: { Ask: null },
      // The auction is not over until the deadline according to the
      // provided timer. The seller cannot exit beforehand.
      exit: { waived: null },
    });
    // Save the seat for when the auction closes.
    sellSeat = seat;

    // The bid invitations can only be sent out after the assets to be
    // auctioned are escrowed.
    return Far('offerResult', { makeBidInvitation });
  };

  const creatorFacet = Far('creatorFacet', {
    creatorInvitation: () =>
      zcf.makeInvitation(sellItem, 'sell item via auction'),
  });
  return { creatorFacet };
};

export { start };
