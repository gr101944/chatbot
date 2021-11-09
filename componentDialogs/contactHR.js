const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ActivityHandler, MessageFactory } = require('botbuilder');

const {ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt  } = require('botbuilder-dialogs');

const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');


const CHOICE_PROMPT    = 'CHOICE_PROMPT';
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const NUMBER_PROMPT    = 'NUMBER_PROMPT';
const DATETIME_PROMPT  = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog ='';

class ContactHR extends ComponentDialog {
    
    constructor(conversationState,userState) {
        super('contactHR');

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT,this.noOfParticipantsValidator));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.conversationState = conversationState;
        this.conversationData = this.conversationState.createProperty('conservationData');

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.getProblemArea.bind(this),  // Get getProblemArea           
            this.getProblemBrief.bind(this),    // Get getProblemBrief
            this.sendEmail.bind(this),    // send Email            
        ]));

        this.initialDialogId = WATERFALL_DIALOG;

   }

    async run(turnContext, accessor, entities) {
        console.log ("Reached 4")
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        console.log ("Reached 5")
        const results = await dialogContext.continueDialog();
        console.log ("Reached 6")
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id, entities);
        }
    }

    async getProblemArea(step) {
        console.log ("In getProblemArea")
        

        var problemArea = ["Benefits", "Covid", "Training", "Vacation", "Cancel"]

        endDialog = false;
        // Running a prompt here means the next WaterfallStep will be run when the users response is received.
        return await step.prompt(CHOICE_PROMPT, 'What is the area in which you have raised a query?', problemArea);
           
    }

    async getProblemBrief(step){
        console.log ("In getProblemBrief")        
        step.values.probArea = step.result.value
       // console.log ("probArea " + probArea)
       // await conversationData.set(step.context,{problemAreaSaved: probArea});
      // await conversationData.set(step.con)
        if(step.result === "Cancel")
        { 
            await step.context.sendActivity("You chose to cancel");
            endDialog = true;
            return await step.endDialog();   
        } else{
        
        var problemBrief= ["Result not useful", "Need more info", "No Results", "Timed out", "Cancel"]

        return await step.prompt(CHOICE_PROMPT, 'What is the problem brief?', problemBrief);
        }
        
    }

    async sendEmail(step){
        console.log ("In sendEmail") 
        console.log (step.values.probArea)
      //   console.log(JSON.stringify(step))
        // const conversationData = await this.conversationData.get(step.context,{});  
        // console.log (conversationData.problemAreaSaved)
       // console.log(step)
        var probBrief = step.result.value

        await step.context.sendActivity("### Problem Area: " + step.values.probArea + " ,  Problem brief: " + probBrief + " \n \n eMail sent to People Team. You can continue with your search...")
        await this.sendSuggestedActions6(step.context);
        endDialog = true;
        return await step.endDialog();   
    
    }
    async sendSuggestedActions6(turnContext) {
        var reply = MessageFactory.suggestedActions(['People', 'IT Services', 'Not sure', 'Cancel']);
        await turnContext.sendActivity(reply);
    }



    async isDialogComplete(){
        return endDialog;
    }
}

module.exports.ContactHR = ContactHR;








