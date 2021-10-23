// variable to hold db connection
let db;

// establish connection to the IndexedDB database "budget_tracker", starting at version 1.
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(e) {
    // save a reference to the db
    const db = e.target.result;
    // create an object store called 'budget-events'. indexedDB's version of a primary key set to auto-incrementing
    db.createObjectStore('budget_events', { autoIncrement: true });
};

request.onsuccess = function(e) {
    // when db is successfully created or simply established a connection, save reference to db in global variable
    db = e.target.result;

    // check if app is online, running function to send local db to api if yes
    if (navigator.onLine) {
        // uploadTransaction();
    }
};

request.onerror = function(e) {
    // log error here
    console.log(e.target.errorCode);
};

// function to be executed if we attempt to submit a transaction
function saveRecord(record) {
    // open a new transaction with the database with read and write permission.
    const transaction = db.transaction(['budget_events'], 'readwrite');

    // access the object store for budget_event
    const budgetObjectStore = transaction.budgetObjectStore('budget_events');

    // add record to your store with add method
    budgetObjectStore.add(record);
}

function uploadTransaction() {
    // open a transaction on the db
    const transaction = db.transaction(['budget_events'], 'readwrite');

    // access the object store
    const budgetObjectStore = transaction.objectStore('budget_events');

    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();
}