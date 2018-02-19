const utilities = require('@source4society/scepter-utility-lib')
const makeSequenceCallbackFunction = (generator, finalCallback) => (err, data) => utilities.isNotEmpty(err) ? finalCallback(utilities.valueOrDefault(err.message, err)) : generator.next(data)

const initiateSequenceFunction = (sequence, callback, injectMakeSequenceCallback) => {
  const makeSequenceCallback = utilities.valueOrDefault(injectMakeSequenceCallback, makeSequenceCallbackFunction)
  let sequenceCallback = makeSequenceCallback(sequence, callback)
  sequence.next()
  sequence.next(sequenceCallback)
}

const initiateHandledSequenceFunction = (sequence, callback, injectedSequenceHandler, injectedInitiateSequence) => {
  const sequenceHandler = utilities.valueOrDefault(injectedSequenceHandler, sequenceHandlerFunction)
  const initiateSequence = utilities.valueOrDefault(injectedInitiateSequence, initiateSequenceFunction)
  const handledSequence = sequenceHandler(callback, sequence)
  initiateSequence(handledSequence, callback)
}

function * sequenceHandlerFunction (finalCallback, sequence) {
  try {
    const sequenceCallback = yield
    yield * sequence(finalCallback, sequenceCallback)
  } catch (error) {
    finalCallback(error)
  }
}

const invokeScepterLambdaServiceFunction = (
  serviceKey,
  payload,
  stage,
  AWS,
  services,
  credentials,
  parameters,
  callback,
  injectedRegion,
  injectedAccount,
  injectedServiceName,
  injectedFunction
) => {
  const region = utilities.valueOrDefault(injectedRegion, credentials.getIn(['environments', stage, 'aws', 'region']))
  const account = utilities.valueOrDefault(injectedAccount, credentials.getIn(['environments', stage, 'aws', 'account']))
  const serviceName = utilities.valueOrDefault(injectedServiceName, services.getIn(['environments', stage, 'configuration', serviceKey, 'serviceName']))
  const func = utilities.valueOrDefault(injectedFunction, services.getIn(['environments', stage, 'configuration', serviceKey, 'function']))
  const lambda = new AWS.Lambda({ region })
  lambda.invoke({
    FunctionName: `${account}:${parameters.get('appName')}-${serviceName}-${stage}-${func}`,
    Payload: JSON.stringify(payload, null, 2)
  }, callback)
}

module.exports.makeSequenceCallback = makeSequenceCallbackFunction
module.exports.initiateSequence = initiateSequenceFunction
module.exports.initiateHandledSequence = initiateHandledSequenceFunction
module.exports.sequenceHandler = sequenceHandlerFunction
module.exports.invokeScepterLambdaService = invokeScepterLambdaServiceFunction
