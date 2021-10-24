// variable to hold db connection
let db;

// establish connection to the IndexedDB database "budget_tracker", starting at version 1.
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    // save a reference to the db
    const db = event.target.result;
    // create an object store called 'budget-events'. indexedDB's version of a primary key set to auto-incrementing
    db.createObjectStore('budget_events', { autoIncrement: true });
};

request.onsuccess = function(event) {
    // when db is successfully created or simply established a connection, save reference to db in global variable
    db = event.target.result;

    // check if app is online, running function to send local db to api if yes
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// function to be executed if we attempt to submit a transaction
function saveRecord(record) {
    // open a new transaction with the database with read and write permission.
    const transaction = db.transaction(['budget_events'], 'readwrite');

    // access the object store for budget_event
    const budgetObjectStore = transaction.objectStore('budget_events');

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

    getAll.onsuccess = function() {
        // if data in indexedDb's store, send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['budget_events'], 'readwrite');
                    // access the object store
                    const budgetObjectStore = transaction.objectStore('budget_events');
                    // clear all items in your store
                    budgetObjectStore.clear();

                    alert('Connection re-established, budget transactions submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);