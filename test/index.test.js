const utilities = require('@source4society/scepter-utility-lib')

test('makeSequenceCallback creates a callback to be passed to generator.next', (done) => {
  const mockError = new Error('mockError')
  const mockData = { hasProperties: 'mockData' }
  const mockCallback = (err, data) => {
    if (utilities.isEmpty(err)) {
      expect(data).toEqual(mockData)
      done()
    } else {
      expect(err).toEqual(mockError.message)
    }
  }
  function * mockGenerator () {
    const data = yield
    mockCallback(null, data)
  }
  const makeSequenceCallback = require('../index').makeSequenceCallback
  const generatorObject = mockGenerator()
  generatorObject.next()
  makeSequenceCallback(generatorObject, mockCallback)(mockError)
  makeSequenceCallback(generatorObject, mockCallback)(null, mockData)
})

test('initiateSequenceFunction takes a sequence generator and a callback and initiates the inititial sequence steps', (done) => {
  const mockSequenceCallback = (err, data) => {
    expect(err).toBeNull()
    expect(data).toBeTruthy()
    done()
  }
  const mockCallback = () => {}
  const mockGenerator = {
    hasProperties: 'mockGenerator',
    next: (sequenceCallback) => {
      if (utilities.isNotEmpty(sequenceCallback)) {
        sequenceCallback(null, true)
      }
    }
  }
  const mockMakeSequenceCallback = (sequence, callback) => {
    expect(sequence).toEqual(mockGenerator)
    expect(callback).toEqual(mockCallback)
    return mockSequenceCallback
  }
  const initiateSequence = require('../index').initiateSequence
  initiateSequence(mockGenerator, mockCallback, mockMakeSequenceCallback)
})

test('initiateHandledSequence kicks off a custom wrapped sequence', (done) => {
  const mockSequence = () => {}
  const mockHandledSequence = { hasProperties: 'mockHandledSequence' }
  function mockCallback (err, data) {
    expect(err).toBeNull()
    expect(data).toBeTruthy()
    done()
  }
  const mockSequenceHandler = (finalCallback, callback) => {
    expect(finalCallback).toEqual(mockCallback)
    expect(callback).toEqual(mockSequence)
    return mockHandledSequence
  }
  const mockInitiateSequence = (handledSequence, callback) => {
    expect(handledSequence).toEqual(mockHandledSequence)
    callback(null, true)
  }
  const initiateHandledSequence = require('../index').initiateHandledSequence
  initiateHandledSequence(mockSequence, mockCallback, mockSequenceHandler, mockInitiateSequence)
})

test('sequenceHandlerFunction will send error to final callback, otherwise trigger sequence callback', (done) => {
  const mockError = new Error('mockError')
  function * mockSequenceWithError (finalCallback, sequenceCallback) {
    throw mockError
  }
  function * mockSequenceWithSuccess (finalCallback, sequenceCallback) {
    const response = yield setTimeout(() => sequenceCallback(null, true), 10)
    finalCallback(null, response)
  }
  const mockCallback = (err, data) => {
    if (utilities.isNotEmpty(err)) {
      expect(err).toEqual(mockError)
      expect(data).toBeUndefined()
      expect(data).toBeUndefined()
    } else {
      expect(data).toBeTruthy()
      done()
    }
  }
  const sequenceHandler = require('../index').sequenceHandler
  const initiateSequence = require('../index').initiateSequence
  initiateSequence(sequenceHandler(mockCallback, mockSequenceWithError))
  initiateSequence(sequenceHandler(mockCallback, mockSequenceWithSuccess))
})

test('invokeScepterLambdaService invokes a lambda based on scepter configurations and passes the payload to the callback', (done) => {
  const fromJS = require('immutable').fromJS
  const mockServiceKey = 'mockServiceKey'
  const mockPayload = { hasProperties: 'mockPayload' }
  const mockPayloadString = JSON.stringify(mockPayload, null, 2)
  const mockStage = 'mockStage'
  const mockRegion = 'mockRegion'
  const mockAccount = 'mockAccount'
  const mockParameters = {
    get: (value) => {
      expect(value).toEqual('appName')
      return 'mockAppName'
    }
  }
  const mockServiceName = 'mockServiceName'
  const mockFunction = 'mockFunc'
  const mockResponse = { hasProperties: 'mockResponse' }
  const mockServices = fromJS({ hasProperties: 'mockServices' })
  const mockCredentials = fromJS({ hasProperties: 'mockCredentials' })
  const mockAWS = {
    Lambda: class {
      construct (parameters) {
        expect(parameters).toEqual({ mockRegion })
      }
      invoke (parameters, callback) {
        expect(parameters).toEqual({
          FunctionName: `${mockAccount}:${mockParameters.get('appName')}-${mockServiceName}-${mockStage}-${mockFunction}`,
          Payload: mockPayloadString
        })
        setTimeout(() => callback(null, mockResponse), 10)
      }
    }
  }
  const mockCallback = (err, data) => {
    expect(err).toBeNull()
    expect(data).toEqual(mockResponse)
    done()
  }
  const invokeScepterLambdaService = require('../index').invokeScepterLambdaService
  invokeScepterLambdaService(
    mockServiceKey,
    mockPayload,
    mockStage,
    mockAWS,
    mockServices,
    mockCredentials,
    mockParameters,
    mockCallback,
    mockRegion,
    mockAccount,
    mockServiceName,
    mockFunction
  )
})
