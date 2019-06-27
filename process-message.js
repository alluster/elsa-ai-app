const Dialogflow = require('dialogflow');
const Pusher = require('pusher');
const uuidv1 = require('uuid/v1');
const projectId = 'elsa-eygvdo'; 
const sessionId = uuidv1()
const languageCode = 'en-US';
const key = () => {
  if(process.env.NODE_ENV === 'dev'){
    return process.env.REACT_APP_DIALOGFLOW_PRIVATE_KEY
  } else {
    return JSON.parse(process.env.REACT_APP_DIALOGFLOW_PRIVATE_KEY)
  }
  

}
const config = {
  credentials: {
    private_key: key(),
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

const processMessage = (message) => {
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  console.log(sessionId)
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

      if (result.intent.displayName === 'Technology') {
        const tech = result.parameters.fields['technology'].stringValue;      
          return pusher.trigger('bot', 'bot-response', {
            message: `I suggest you call Lasse about ${tech || 'that'}. His phone number is +358 40 770 7107`,
          });
      }
      else if (result.intent.displayName === 'Design') {
        const design = result.parameters.fields['design'].stringValue;      
          return pusher.trigger('bot', 'bot-response', {
            message: `I suggest you call Aleksanteri Heliövaara about ${design || 'that'}. His phone number is +358442360304`,
            
          });
      }
      else if (result.intent.displayName === 'Business') {
        const business = result.parameters.fields['business'].stringValue;      
          return pusher.trigger('bot', 'bot-response', {
            message: `I suggest you call Tommi Heinonen (CEO) about ${business || 'that'}. His phone number is +358 50 581 3832`,
          });
      }
      else {
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

