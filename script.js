import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js'
import { getDatabase, ref, push, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js'

const appSettings = {
    databaseURL: "https://realtime-database-6421e-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase (app)
const shoppingListInDB = ref (database, "shoppingList") 

const inputField = document.querySelector('#input-field')
const addBtn = document.querySelector('#add-button')
const shoppingList = document.querySelector('.shopping-list')

addBtn.addEventListener('click', function() {
    let inputValue = inputField.value.trim().toLowerCase()

    if (inputValue !== '') {
        if (!noRepeatItem(inputValue)){
            push(shoppingListInDB, inputValue)

            clearInputField() 
        } else {
            alert('Is already on the list!')
        } 
    } else{
        alert('ADD an item to the list!');
    }
});

//Updating items in realtime
onValue(shoppingListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())

        clearShoopingList()
        
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            addItemToShoopingList(currentItem)
        }
    } else {
        shoppingList.innerHTML = "No items here... yet"
    }
})

//
function clearShoopingList(){
    shoppingList.innerHTML = ''
}

function clearInputField() {
    inputField.value = '';
}

//add an item
function addItemToShoopingList(item) {
    let itemID = item[0]
    let itemValue = item[1]

    let newItem = document.createElement('li')

    newItem.textContent = itemValue

    newItem.addEventListener('click', function(){
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)
        remove(exactLocationOfItemInDB)
    })

    shoppingList.append(newItem)
}

function noRepeatItem(itemName) {
    const items = shoppingList.querySelectorAll('li');
    for (const item of items) {
        if (item.textContent.trim() === itemName) {
            return true; // item found in the list
        }
    }
    return false; // item not found in the list
}