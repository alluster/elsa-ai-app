const Dialogflow = require('dialogflow');
const Pusher = require('pusher');

// You can find your project ID in your Dialogflow agent settings
const projectId = 'elsa-eygvdo'; //https://dialogflow.com/docs/agents#settings
const sessionId = '123456';
const languageCode = 'en-US';

const config = {
  credentials: {
    private_key: JSON.parse(process.env.REACT_APP_DIALOGFLOW_PRIVATE_KEY),
    client_email: process.env.REACT_APP_DIALOGFLOW_CLIENT_EMAIL,
  },
};

const pusher = new Pusher({
  appId: process.env.REACT_APP_PUSHER_APP_ID,
  key: process.env.REACT_APP_PUSHER_APP_KEY,
  secret: process.env.REACT_APP_PUSHER_APP_SECRET,
  cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
});

const sessionClient = new Dialogflow.SessionsClient(config);

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const processMessage = message => {
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode,
      },
    },
  };

  sessionClient
    .detectIntent(request)
    .then(responses => {
      const result = responses[0].queryResult;

      // If the intent matches 'detect-city'
      if (result.intent.displayName === 'Technology') {
        const tech = result.parameters.fields['technology'].stringValue;

        // fetch the temperature from openweather map
        return () => {
          return pusher.trigger('bot', 'bot-response', {
            message: `I suggest you call Tommi about ${tech}`,
          });
        
      }

      return pusher.trigger('bot', 'bot-response', {
        message: result.fulfillmentText,
      });
    }
  })
    .catch(err => {
      console.error('ERROR:', err);
    });
};

module.exports = processMessage;

