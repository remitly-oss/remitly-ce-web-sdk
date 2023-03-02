# Overview

TODO: Describe Remitly CE.

# How to use

Attach the following script tag to your html:

`<script src="https://media.remitly.io/TODO.js"></script>`

Then you can reference Remitly via:

`window.Remitly()`

## Options

-   `appId: <string>` Unique identifier for your app. Get this from your Remitly contact
-   `environment: <string>` one of `staging` | `production`
-   `customerCountry: <string>` 3 letter country code
-   `customerLanguage: <string>` 2 letter language code
-   `defaultReceiveCountry?: <string>` - optional - 3 letter country code for the default country a customer wants tosend money to
-   `customerEmail?: <string>` - optional - a string containing the customer's email

`layout` governs how the Remitly modal will display inside of your host app. Options are:

-   `modalPosition` Options are `center`, `left`, and `right`, to control which side of the screen the modal floats to.

`onLoad` is a callback that triggers once the Remitly website has loaded within the iframe.
`onClose` is a callback that triggers when the user closes the Remitly experience from within the experience.
`onMessage` is a callback that triggers for events, such as the `userActivity` heartbeat. Please see the ../README.md for more info on events.

