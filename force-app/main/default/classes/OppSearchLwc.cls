public class OppSearchLwc {
    @AuraEnabled
       public static List<Opportunity> fetchOpp(String search)
       {   
           double Amount;
           try{
               Amount=double.valueOf(search);
               return [select Name,AccountId,Account.Name,StageName,Type,Amount from Opportunity where Amount=:Amount];
               //System.debug(Amount);
           }catch(Exception e){
               Amount=null;
               System.debug('catch'+e.getMessage());
           }
           String str = '%'+search+'%';
           return [select Name,AccountId,Account.Name,StageName,Type,Amount from Opportunity where Name like :str or StageName like:str or Type like:str];
           
       }
   }