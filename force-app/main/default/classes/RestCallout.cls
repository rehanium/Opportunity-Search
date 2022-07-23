public with sharing class RestCallout {
    

    public static String makeCallout(Id oppid) {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://jsonplaceholder.typicode.com/todos/1');
        req.setMethod('GET');
        HttpResponse res = new HttpResponse();
        res = http.send(req);

        System.debug(res.getStatusCode());
        Opportunity opp = new Opportunity();
        if (res.getStatusCode() == 200) {
            opp.Id = oppid;
            opp.Integration_Status__c = 'Success';
            update opp;
        }
    }
}
