# SCEPTER-utility-lib
[![scepter-logo](http://res.cloudinary.com/source-4-society/image/upload/v1514622047/scepter_hzpcqt.png)](https://github.com/source4societyorg/SCEPTER-core)

[![js-standard-style](https://cdn.rawgit.com/standard/standard/master/badge.svg)](http://standardjs.com)

[![Build Status](https://travis-ci.org/source4societyorg/SCEPTER-service-utility-lib.svg?branch=master)](https://travis-ci.org/source4societyorg/SCEPTER-utility-lib.svg?branch=master)

[![codecov](https://codecov.io/gh/source4societyorg/SCEPTER-service-utility-lib/branch/master/graph/badge.svg)](https://codecov.io/gh/source4societyorg/SCEPTER-utility-lib)

A library of useful javascript utility functions

## Usage

Add this library to your project via `npm` or `yarn` with the command:

    npm install -S @source4society/scepter-service-utility-lib
or
    yarn add @source4society/scepter-service-utility-lib

Then in your code, you can reference the individual utility functions. For example, to export the `initiateHandledSequence` function:

    const initiateHandledSequence = require('@source4society/scepter-service-utility-lib').initiateHandledSequence

## Functions

### makeSequenceCallback

This is a helper function usually called by some of the other functions in this library. It takes a sequence (generator object) and a "final callback" and returns a callback function that will pass any errors into the "final callback" if errors is not empty while passing anything in data to the generators next() function. Useful for converting a series of steps with callbacks into sequential code for easy testing and debugging.

### initiateSequence

This will take a generator object and a callback, create the sequenceCallback for this generator and kick off the generator's initial `next` call as well as provide a second `next` call that passes in the sequence callback as an argument so that it can be accessed within the generator (the generator should make arrangements to receive the sequenceCallback with the field `yield`).

### initiateHandledSequence 

Similar to initiateSequence except this function wraps the generator function in a sequence handler. The default sequence handler is described below. Takes a sequence generator object and the final callback as arguments

### sequenceHandler

This returns a generator function that wraps the original sequence generator in a try catch block so any errors thrown from the sequence will be caught and passed to the error position of the final callback

### invokeScepterLambdaService

This function will use the AWS SDK to invoke a Lambda function using the naming conventions according to [SCEPTER](https://github.com/source4societyorg/SCEPTER-Core). The function takes the `serviceKey` (of the service to invoke in `services.json`), a `payload`, the environment `stage`, the AWS SDK, `services`, `credentials`, and `parameters` json files as immutable objects, and a `callback`. The function will attempt to extract the `region`, `account`, `serviceName`, and `function` from the appropriate configuration files before calling invoke.