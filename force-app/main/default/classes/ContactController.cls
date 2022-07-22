public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContact(){
        try {
            return [select FirstName,LastName,Email,Phone from contact];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}