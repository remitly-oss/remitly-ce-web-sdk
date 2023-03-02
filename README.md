<img src=".github/Remitly_Horizontal_Logo_Preferred_RGB_Indigo_192x44.png" title="Remitly Logo" />


# Remitly Connected Experiences SDK for Web

This is the SDK for integrating the Remitly experience into desktop and mobile web apps.

## How to use

Attach the following script tag to your html:

`<script src="https://media.remitly.io/remitly-ce-web-sdk-<version>.js"></script>`

Then you can reference Remitly via `window.Remitly`, invoke the initialize function once, and then use the open function at an ingress point.

### Configuration

Here are the fields available to configure the Remitly experience.

-   `appId: <string>` - Unique identifier for your app. Get this from your Remitly contact
-   `environment: production` - must be set to production
-   `customerCountry: <string>` - three-letter country code
-   `customerLanguage: <string>` - two-letter language code
-   `defaultReceiveCountry?: <string>` - optional - 3 letter country code for the default country a customer wants tosend money to
-   `customerEmail?: <string>` - optional - a string containing the customer's email

`layout` governs how the Remitly modal will display inside of your host app. Options are:

-   `modalPosition` Options are `center`, `left`, and `right`, to control which side of the screen the modal floats to.

`onLoad` is a callback that triggers once the Remitly website has loaded within the iframe.
`onClose` is a callback that triggers when the user closes the Remitly experience from within the experience.
`onMessage` is a callback that triggers for events, such as the `userActivity` heartbeat. Please see the ../README.md for more info on events.

## React Example

### Initialization
```
React.useEffect(() => {
    if (Remitly) {
        Remitly.initialize({
            appId,
            customerCountry,
            customerLanguage,
            defaultReceiveCountry,
            environment,
            enableConsoleLogs,
            onMessage,
            onStateChange
        });
    }
}, [appId, customerCountry, customerLanguage, receiveCountry, environment, Remitly]);
```

### Ingress
```
<Button title={'Open Remitly'} onPress={() => Remitly.open?.({ modalPosition: modalPosition as 'center' | 'left' | 'right' })}/>
```
