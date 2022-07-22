import { LightningElement, wire, track } from 'lwc';
import getAccount from '@salesforce/apex/OppSearchLwc.fetchOpp';

const columns = [
  { label: 'Name', fieldName: 'Name', type: 'text' },
  { label: 'Account Name', fieldName: 'AccountName', type: 'text' },
  { label: 'Stage', fieldName: 'StageName', type: 'text' },
  { label: 'Type', fieldName: 'Type', type: 'text' },
  { label: 'Amount', fieldName: 'Amount', type: 'number' },
  {
    label: 'AccountURL', fieldName: 'AccountRecord', type: 'url'
    , typeAttributes: {
      label: {
        fieldName: 'AccountName'
      }
    }
  },
  {
    label: 'OppURL', fieldName: 'OppRecord', type: 'url'
    , typeAttributes: {
      label: {
        fieldName: 'Name'
      }
    }
  },
  {label: 'Send Record', type: 'button', typeAttributes: {  
        label: 'Send',  
        name: 'Send',  
        title: 'Send',  
        disabled: false,  
        value: 'send'
  }
  }
];

export default class OppSearch extends LightningElement {
  @track buttonTrue=true;
  cols = columns;
  result;
  error;
  searchKey;
  pageSize = 10;
  startPage = 0;
  EndPage = 10;
  temp = [];
  tempResult;

  handlePrevious() {
    this.startPage = this.startPage - this.pageSize;
    this.EndPage = this.EndPage - this.pageSize;
    this.handlePaginaion();
    console.log(this.startPage);
    
    if(this.startPage <=0) {
      this.buttonTrue=true;
    }
    

  }

  handleNext() {
    this.startPage = this.startPage + this.pageSize; //5 //10
    this.EndPage = this.EndPage + this.pageSize;//10 //15
    this.handlePaginaion();
    console.log(this.startPage);
    if(this.startPage >0) {
      this.buttonTrue=false;
    }
  }

  handlePaginaion() //12 data
    {console.log('length '+this.tempResult.length);
        if(this.tempResult.length > this.pageSize)
            {
                for(let i=this.startPage;i<this.EndPage;i++) //0,4
                { 
                    if(i <= this.tempResult.length )
                    {
                    this.temp.push(this.tempResult[i]);
                    }
                }
                console.log('temp value '+this.temp);
                this.result = this.temp; //result have value 5
                this.temp=[]; //temp is null
            }
            else
           this.result = this.tempResult;
    }

  handleData(ajay) {
    console.log(ajay.target.value);
    this.searchKey = ajay.target.value;
    this.handleClick();
  }
  handleClick() {
    getAccount({ 'search': this.searchKey }).then(accData => {
      this.result = accData;
      
      console.table("tempResult: "+this.tempResult); //12 data

      let maindata = [];
      this.result.forEach(acc => {
        let oppdata = {};
        oppdata.AccountName = acc.Account.Name;
        oppdata.id = acc.id;
        oppdata.Name = acc.Name;
        oppdata.StageName = acc.StageName;
        oppdata.Type = acc.Type;
        oppdata.Amount = acc.Amount;
        oppdata.AccountRecord = 'https://capgemini439-dev-ed.lightning.force.com/lightning/r/Account/' + acc.AccountId + '/view';
        oppdata.OppRecord = 'https://capgemini439-dev-ed.lightning.force.com/lightning/r/Opportunity/' + acc.Id + '/view';
        maindata.push(oppdata);
      });
      this.result = maindata;

      this.tempResult =maindata;
      this.handlePaginaion();
    }).catch(er => {
      this.error = er;
    });
  }
}