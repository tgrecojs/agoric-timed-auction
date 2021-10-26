// @ts-check
import { test } from '@agoric/zoe/tools/prepare-test-env-ava.js';
import { resolve as importMetaResolve } from 'import-meta-resolve';

import bundleSource from '@agoric/bundle-source';

import { E } from '@agoric/eventual-send';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKit } from '@agoric/zoe';
import { makeIssuerKit, AmountMath } from '@agoric/ertp';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { setupMixed } from './setupMixedMints.js';

const contractPath = new URL('../src/auction-code.js', import.meta.url)
  .pathname;

test('zoe - create auction contract', async (t) => {
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
  const {
    mint: moolaMint,
    issuer: moolaIssuer,
    brand: moolaBrand,
  } = makeIssuerKit('moola');

  // We will also install the sellItems contract from agoric-sdk
  const bundleUrl = await importMetaResolve(
    '@agoric/zoe/src/contracts/sellItems.js',
    import.meta.url,
  );
  const bundlePath = new URL(bundleUrl).pathname;

  const sellerProposal = harden({
    give: { Asset: moola(1000) },
    want: { Ask: cryptoCats(4) },
  });
  const terms = {
    closesAfter: 20000n,
    timeAuthority: buildManualTimer(console.log),
  };
  const tgArtKit = makeIssuerKit('TgArt');

  const issuerKeywordRecord = harden({
    Asset: tgArtKit.issuer,
    Ask: moolaIssuer,
  });
  const auctionRootInstance = await E(zoe).startInstance(
    installation,
    issuerKeywordRecord,
    terms,
  );

  console.log({ auctionRootInstance });

  t.truthy(await auctionRootInstance, 'contract should contain creatorFacet');
  console.log({ tgArtKit });
  const { creatorFacet } = auctionRootInstance;
  const createAuctionRef = await E(creatorFacet).createAuction(
    tgArtKit,
    moolaIssuer,
    installation,
    4n,
  );

  const creatorSeat = await E(zoe).offer(
    createAuctionRef,
    harden({
      give: { Asset: AmountMath.make(tgArtKit.brand, 1n) },
      want: {
        Ask: AmountMath.make(moolaBrand, 4n),
      },
    }),
    harden({
      Asset: tgArtKit.mint.mintPayment(AmountMath.make(tgArtKit.brand, 1n)),
    }),
  );
  t.truthy(await E(creatorSeat).getOfferResult(), 'creatorSeat.getOfferResult');

  const bigInvited = await E(creatorSeat).publicBidInvitation();
  t.truthy(await E(bigInvited), 'bidInvite');
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
