### Debugging Tips

- When dealing with Errors, go to the 1st Error in the stack trace. Why? Because often times one error will result in Zoe throwing Error's for the code evaluated after the initial Error.

### Example Error

-

```
Could not schedule the close of the auction at the 'closesAfter' deadline [object Alleged: moola payment] using this timer [object Alleged: ManualTimer]
(TypeError#1)
TypeError#1: Object [Alleged: moola payment] {
  getAllegedBrand: [Function: getAllegedBrand]
} must be a bigint
  at makeError (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3037:17)
  at fail (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3165:20)
  at baseAssert (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3183:13)
  at equal (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3194:5)
  at Function.assertTypeof [as typeof] (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3213:5)
  at Alleged: ManualTimer.setWakeup (file:///Users/tgreco/agoric-sdk/packages/zoe/tools/manualTimer.js:100:20)
  at localApplyMethod (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/local.js:125:10)
  at Object.applyMethod (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:455:16)
  at dispatchToHandler (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:161:22)
  at doDispatch (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:482:7)
  at file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/track-turns.js:66:22
  at win (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:500:19)
  at file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:518:20

TypeError#1 ERROR_NOTE: Thrown from: (Error#2) : 29 . 0
Nested error under TypeError#1
  Error#2: Event: 28.1
    at trackTurns (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/track-turns.js:49:24)
    at handle (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:491:33)
    at Function.applyMethod (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:419:14)
    at Proxy.eval (eval at <anonymous> (eval at makeEvaluateFactory (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3305:10)), <anonymous>:39:49)
    at Proxy.start (eval at <anonymous> (eval at makeEvaluateFactory (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3305:10)), <anonymous>:38:3)
    at localApplyMethod (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/local.js:125:10)
    at Object.applyMethod (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:455:16)
    at dispatchToHandler (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:161:22)
    at doDispatch (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:482:7)
    at file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/track-turns.js:66:22
    at win (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:500:19)
    at file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:518:20

  Error#2 ERROR_NOTE: Caused by: (Error#3)
  Nested error under Error#2
    Error#3: Event: 27.1
      at trackTurns (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/track-turns.js:49:24)
      at handle (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:491:33)
      at Function.applyMethod (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:419:14)
      at Proxy.eval (eval at <anonymous> (eval at makeEvaluateFactory (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3305:10)), <anonymous>:39:49)
      at Object.startContract (eval at <anonymous> (eval at makeEvaluateFactory (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3305:10)), <anonymous>:368:7)
      at Alleged: executeContract.executeContract (eval at <anonymous> (eval at makeEvaluateFactory (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3305:10)), <anonymous>:50:22)
      at localApplyMethod (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/local.js:125:10)
      at Object.applyMethod (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:455:16)
      at dispatchToHandler (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:161:22)
      at doDispatch (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:482:7)
      at file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/track-turns.js:66:22
      at win (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:500:19)
      at file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:518:20

    Error#3 ERROR_NOTE: Caused by: (Error#4)
    Nested error under Error#3
      Error#4: Event: 26.1
        at trackTurns (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/track-turns.js:49:24)
        at handle (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:491:33)
        at Function.applyMethod (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:419:14)
        at file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/postponed.js:30:55

REJECTED from ava test: (Error#5)
Error#5: The Asset keyword in proposal.give did not have an associated payment in the paymentKeywordRecord, which had keywords: [ 'Asset' ]
  at makeError (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3037:17)
  at fail (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3165:20)
  at baseAssert (file:///Users/tgreco/agoric-sdk/node_modules/ses/dist/ses.umd.js:3183:13)
  at file:///Users/tgreco/agoric-sdk/packages/zoe/src/zoeService/escrowStorage.js:96:9
  at Array.map (<anonymous>)
  at depositPayments (file:///Users/tgreco/agoric-sdk/packages/zoe/src/zoeService/escrowStorage.js:95:20)
  at Alleged: zoeServiceFeePurseRequired.offer (file:///Users/tgreco/agoric-sdk/packages/zoe/src/zoeService/offer/offer.js:85:37)

Error#5 ERROR_NOTE: Rejection from: (Error#6) : 32 . 2
Nested error under Error#5
  Error#6: Event: 31.1
    at trackTurns (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/track-turns.js:49:24)
    at handle (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:491:33)
    at Function.applyMethod (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/handled-promise.js:419:14)
    at Proxy.<anonymous> (file:///Users/tgreco/agoric-sdk/packages/eventual-send/src/E.js:39:49)
    at Object.offer (file:///Users/tgreco/agoric-auction/dapp-auction-house/contract/test/test-contract.js:77:35)
    at file:///Users/tgreco/agoric-auction/dapp-auction-house/contract/test/test-contract.js:234:65
```

code following this be i throwing
