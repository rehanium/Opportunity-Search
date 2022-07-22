import { LightningElement } from 'lwc';
import getClient from '@salesforce/apex/ContactController.getContact';

export default class PaginationExample extends LightningElement 
{
    clientFilterQuery;
    showSpinner=true;
    allClients; //storing all clients data. Not to be modified
    allFilteredClients; //storing all filtered clients data. can be modified
    paginatedClientData; //storing array of client data based on limit chunks
    dataToDisplay; // storing only the data that need to be displayed
    pageLimit = '10'; //number of record to display per page
    pages=[{ label: '1', value: '1' }]; //pagination data (total pages)
    selectedPage='1'; //current selected page
    totalPages; //store total number of pages
    isFisrt=true;
    isLast=false;
    isAsc=true; //sorting logic
    totalRecords;
    pageParam;

    //get options for the limit dropdown
    get pageLimitOptions() {
        return [
            { label: 'Step: 10', value: '10' },
            { label: 'Step: 25', value: '25' },
            { label: 'Step: 50', value: '50' },
            { label: 'Step: 100', value: '100' },
        ];
    }

    connectedCallback()
    {
        getClient()
        .then(res=>{
            this.isLast=false;
            this.isFirst=true;
            var obj=JSON.parse(JSON.stringify(res));
            obj.forEach(elem=>{
                elem.search= elem.LastName.toUpperCase();
                elem.sortLogic= elem.LastName.toUpperCase(); // lowercase characters have ASCII lower than uppercase characters
            })
            this.totalRecords=obj.length;
            this.allClients=obj;
            this.allFilteredClients=obj;
            this.handlePagination(); //invoking the pagination logic
            this.validatePagination(); 
            this.showSpinner=false;
        })
        .catch(err=>{
            console.log(err)
        })    
    }

    compare(a, b) {
        // Use toUpperCase() to ignore character casing
        const bandA = a.LastName.toUpperCase();
        const bandB = b.LastName.toUpperCase();
      
        let comparison = 0;
        if (bandA > bandB) {
          comparison = 1;
        } else if (bandA < bandB) {
          comparison = -1;
        }
        return comparison;
    }
      

    handleSort()
    {
        if(this.isAsc)
        {
            this.allFilteredClients=this.allClients.sort(this.compare);
            this.isAsc=false;
            this.handlePagination();
        }
        else
        {           
            this.allFilteredClients=this.allClients.sort(this.compare).reverse();
            this.isAsc=true;
            this.handlePagination();
        }    
    }

    handleLimitChange(event) {
        this.pageLimit = event.detail.value;
        this.selectedPage='1';
        this.isLast=false;
        this.isFirst=true;
        this.handlePagination(); //invoking the pagination logic
        this.validatePagination(); 
    }

    handlePagination()
    {
        this.pages=[];
        this.totalPages= Math.ceil(this.allFilteredClients.length / parseInt(this.pageLimit));
        console.log(this.totalPages);
        for(var i=1; i <= this.totalPages; i++)
            this.pages.push({ label : 'Page: '+i.toString(), value : i.toString() });
        var perChunk = parseInt(this.pageLimit) // items per chunk    
        var inputArray = this.allFilteredClients;
        var result = inputArray.reduce((resultArray, item, index) => { 
        const chunkIndex = Math.floor(index/perChunk)
        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = [] // start a new chunk
        }
        resultArray[chunkIndex].push(item)
        return resultArray
        }, [])
        this.paginatedClientData=result;
        this.dataToDisplay=this.paginatedClientData[parseInt(this.selectedPage)-1];
    }

    handleNext()
    {
        if(!this.isLast)
            this.selectedPage=(parseInt(this.selectedPage)+1).toString();
        this.dataToDisplay=this.paginatedClientData[parseInt(this.selectedPage)-1];
        this.validatePagination();
    }

    handlePrev()
    {
        if(!this.isFirst)
            this.selectedPage=(parseInt(this.selectedPage)-1).toString();
        this.dataToDisplay=this.paginatedClientData[parseInt(this.selectedPage)-1];
        this.validatePagination();
    }

    handlePageChange(event)
    {
        this.selectedPage= event.detail.value;
        this.dataToDisplay=this.paginatedClientData[parseInt(this.selectedPage)-1];
        this.validatePagination();
    }

    handleFirst()
    {
        this.selectedPage='1';
        this.isFirst=true;
        this.isLast=false;
        this.dataToDisplay=this.paginatedClientData[parseInt(this.selectedPage)-1];
        this.validatePagination();
    }

    handleLast()
    {
        this.selectedPage=this.totalPages.toString();
        this.isFirst=false;
        this.isLast=true;
        this.dataToDisplay=this.paginatedClientData[parseInt(this.selectedPage)-1];
        this.validatePagination();
    }

    validatePagination()
    {
        if(parseInt(this.selectedPage) == 1)
        {
            this.isFirst=true;
            this.isLast=false;
        }
        else if(parseInt(this.selectedPage) == parseInt(this.totalPages))
        {
            this.isFirst=false;
            this.isLast=true;
        }
        else
        {
            this.isFirst=false;
            this.isLast=false;
        }
        var end=(parseInt(this.selectedPage) * parseInt(this.pageLimit)) > this.totalRecords ? this.totalRecords : (parseInt(this.selectedPage) * parseInt(this.pageLimit));
        this.pageParam=(parseInt(this.selectedPage) * parseInt(this.pageLimit) - (parseInt(this.pageLimit)-1))+' to '+end;
    }

    handleFilter(event)
    {
        this.allFilteredClients=this.allClients;
        this.clientFilterQuery= event.target.value;
        var __FOUND = this.allFilteredClients.filter((cli, index)=> {
            if(cli.Full_Name__c.toUpperCase().includes(this.clientFilterQuery.toUpperCase()))
                return true;
        });
        if(__FOUND == undefined || __FOUND==[])
            this.allFilteredClients=this.allClients;
        else
            this.allFilteredClients=__FOUND;
        this.handlePagination();//filtering the client list based on user input
    }
}