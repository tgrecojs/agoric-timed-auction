// @ts-check
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { resolve as importMetaResolve } from 'import-meta-resolve';

import bundleSource from '@agoric/bundle-source';

import { E } from '@agoric/eventual-send';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKit } from '@agoric/zoe';
import { makeIssuerKit, AmountMath, AssetKind } from '@agoric/ertp';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { setupMixed } from './setupMixedMints.js';

const contractPath = new URL('../src/auction-code.js', import.meta.url)
  .pathname;

test('zoe - create auction contract', async (t) => {
  t.plan(5);
  const { zoeService } = makeZoeKit(makeFakeVatAdmin().admin);
  const feePurse = E(zoeService).makeFeePurse();
  const zoe = E(zoeService).bindDefaultFeePurse(feePurse);

  // pack the contract
  const bundle = await bundleSource(contractPath);

  // install the contract
  const installation = await E(zoe).install(bundle);
  const { cryptoCats, ccIssuer, moola } = setupMixed();
  // We'll use an imaginary currency "moola" as the money that we
  // require to buy baseball cards
  const moolaKit = makeIssuerKit('moola');
  const { mint: moolaMint, issuer: moolaIssuer, brand: moolaBrand } = moolaKit;
  // We will also install the sellItems contract from agoric-sdk
  const bundleUrl = await importMetaResolve(
    '@agoric/zoe/src/contracts/auction/secondPriceAuction.js',
    import.meta.url,
  );
  const terms = {
    closesAfter: 1n,
    timeAuthority: buildManualTimer(console.log),
  };
  const tgArtKit = makeIssuerKit('TgArt', AssetKind.SET);
  const oneThousandMoolas = AmountMath.make(moolaBrand, 1000n);
  const issuerKeywordRecord = harden({
    Asset: tgArtKit.issuer,
    Ask: moolaIssuer,
  });
  const auctionContractInstance = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    terms,
  );

  const { creatorFacet, instance } = auctionContractInstance;
  console.log({ auctionContractInstance });

  t.truthy(
    await auctionContractInstance,
    'contract should contain creatorFacet',
  );
  console.log({ tgArtKit });
  const createAuctionRef = await E(creatorFacet).creatorInvitation();

  const auctionCreatorsTerms = await E(zoe).getTerms(instance);

  t.is(auctionCreatorsTerms.closesAfter, 1n);

  const TgArtItem = AmountMath.make(tgArtKit.brand, [{ value: 1n }]);
  const creatorSeat = await E(zoe).offer(
    createAuctionRef,
    harden({
      give: { Asset: TgArtItem },
      want: {
        Ask: oneThousandMoolas,
      },
      exit: { waived: null },
    }),
    harden({
      Asset: tgArtKit.mint.mintPayment(TgArtItem),
    }),
  );

  const auctionCreationResult = await E(creatorSeat).getOfferResult();
  t.truthy(
    auctionCreationResult.makeBidInvitation,
    'Auction creator seat should return a remotable for making bids',
  );

  const { makeBidInvitation } = auctionCreationResult;
  console.log({ makeBidInvitation });

  t.truthy(await makeBidInvitation);

  const bidderSeatOne = await E(zoe).offer(
    await makeBidInvitation(),
    harden({
      want: { Asset: TgArtItem },
      give: { Ask: oneThousandMoolas },
    }),
    harden({
      Ask: moolaKit.mint.mintPayment(oneThousandMoolas),
    }),
  );

  const bidderOnePayout = await E(bidderSeatOne).getOfferResult();
  t.deepEqual(await bidderOnePayout, {}, 'winning bidder payout');
  t.deepEqual(
    (await bidderOnePayout.getAllegedBrand().isMyIssuer(tgArtKit.issuer)) ===
      true,
    true,
    'bbiddersea',
  );
  t.deepEqual(
    (await bidderOnePayout.getAllegedBrand().getAllegedName()) === 'TgArt',
    true,

    'Bid',
  );

  const winnindBidderResult = await bidderSeatOne.getOfferResult();
  t.deepEqual(
    await winnindBidderResult,
    'TgArt',

    'Bid',
  );
  //   const auctionCreatorSeat = await E(zoeService).offer(
  //     creatorFacet,
  //     proposal,
  //     paymentKeywordRecord,
  //   );
  //   const bobInvitation = E(sellItemsCreatorFacet).makeBuyerInvitation();

  //   // Bob buys his own baseball card

  //   const cardIssuer = await E(sellItemsPublicFacet).getItemsIssuer();
  //   const cardBrand = await cardIssuer.getBrand();
  //   const makeCardMath = (value) => AmountMath.make(value, cardBrand);

  //   const cardsForSale = await E(sellItemsPublicFacet).getAvailableItems();
  //   t.deepEqual(cardsForSale, makeCardMath(['Alice', 'Bob']));

  //   // make the corresponding amount
  //   const bobCardAmount = makeCardMath(['Bob']);

  //   const bobProposal = harden({
  //     give: { Money: terms.pricePerItem },
  //     want: { Items: bobCardAmount },
  //   });

  //   const bobPaymentKeywordRecord = harden({
  //     Money: moolaMint.mintPayment(AmountMath.make(moolaBrand, 10n)),
  //   });

  //   const seat = await E(zoe).offer(
  //     bobInvitation,
  //     bobProposal,
  //     bobPaymentKeywordRecord,
  //   );
  //   const bobCardPayout = seat.getPayout('Items');
  //   const bobObtained = await E(cardIssuer).getAmountOf(bobCardPayout);

  //   t.deepEqual(
  //     bobObtained,
  //     makeCardMath(['Bob']),
  //     'Bob bought his own baseball card!',
  //   );

  //   // That's enough selling for now, let's take our inventory back

  //   E(sellItemsCreatorSeat).tryExit();

  //   const moneyPayment = await E(sellItemsCreatorSeat).getPayout('Money');
  //   const moneyEarned = await E(moolaIssuer).getAmountOf(moneyPayment);
  //   t.deepEqual(moneyEarned, AmountMath.make(moolaBrand, 10n));

  //   const cardInventory = await E(sellItemsCreatorSeat).getPayout('Items');
  //   const inventoryRemaining = await E(cardIssuer).getAmountOf(cardInventory);
  //   t.deepEqual(inventoryRemaining, makeCardMath(['Alice']));
});
