const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const {ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt  } = require('botbuilder-dialogs');

const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');


const CHOICE_PROMPT    = 'CHOICE_PROMPT';
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const NUMBER_PROMPT    = 'NUMBER_PROMPT';
const DATETIME_PROMPT  = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog ='';

class ContactITServices extends ComponentDialog {
    
    constructor(conservsationState,userState) {
        super('contactITServices');

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT,this.noOfParticipantsValidator));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.getProblemArea.bind(this),  // Get getProblemArea
            this.getProblemBrief.bind(this),    // Get getProblemBrief
            this.sendEmail.bind(this),    // send Email            
        ]));

        this.initialDialogId = WATERFALL_DIALOG;

   }

    async run(turnContext, accessor, entities) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
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
       // console.log(step.result)
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
        await step.context.sendActivity("eMail sent to IT Services and they will get back to you as soon as possible. You can continue with your search...")
        endDialog = true;
        return await step.endDialog();   
    
    }


// async noOfParticipantsValidator(promptContext) {
//     console.log(promptContext.recognized.value)
//     // This condition is our validation rule. You can also change the value at this point.
//     return promptContext.recognized.succeeded && promptContext.recognized.value > 1 && promptContext.recognized.value < 150;
// }

    async isDialogComplete(){
        return endDialog;
    }
}

module.exports.ContactITServices = ContactITServices;








