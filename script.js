import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js'
import { getDatabase, ref, push, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js'

function initializeModal() {
    const modalElement = document.querySelector('.modal');
    const addItem = document.querySelector('.addItem');
    const contentApp = document.querySelector('.contentApp')
  
    document.addEventListener('DOMContentLoaded', () => {
        modalElement.style.display = 'flex'
        contentApp.style.display = 'none'
    });
  
    addItem.addEventListener('click', function() {
        modalElement.style.display = 'none'
        contentApp.style.display = 'flex'
    });
}
initializeModal();

// link to the Firebase database
const appSettings = {
    databaseURL: "https://realtime-database-6421e-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase (app)
const shoppingListInDB = ref (database, "shoppingList") 

const inputField = document.querySelector('#input-field')
const inputQuantity = document.querySelector('#input-quantity')
const inputType = document.querySelector('#input-type')

const addBtn = document.querySelector('#add-button')
const shoppingList = document.querySelector('.shopping-list')

const modalAlert = document.querySelector('.modal-alert')
const closeAlert = document.querySelector('.close-alert')
const alertDuplicate = document.querySelector('.duplicate')
const closeDuplicate = document.querySelector('.cl-duplicate')

addBtn.addEventListener('click', function() {
    let inputValueF = inputField.value.trim().toLowerCase()
    let inputValueQ = inputQuantity.value
    let inputValueT = inputType.value

    if (inputValueF !== '') {
        checkForDuplicate(inputValueF)
        .then(isDuplicate => {
            if (!isDuplicate) {
                push(shoppingListInDB, {
                    name: inputValueF,
                    quantity: inputValueQ,
                    type: inputValueT
                });

                clearInputField();
            } else {
                alertDuplicate.style.display = 'flex'
                closeDuplicate.addEventListener('click', function() {
                    alertDuplicate.style.display = 'none'
                });
            }
        })
        .catch(error => {
            console.error('Error checking for duplicate:', error);
        });
    } else{
        modalAlert.style.display = 'flex'
        closeAlert.addEventListener('click', function() {
            modalAlert.style.display = 'none'
        });
    }
});

//check duplicate item
function checkForDuplicate(itemName) {
    return new Promise((resolve, reject) => {
        onValue(shoppingListInDB, function(snapshot) {
            if (snapshot.exists()) {
                const itemsArray = Object.values(snapshot.val());
                const isDuplicate = itemsArray.some(item => item.name.toLowerCase() === itemName);
                resolve(isDuplicate);
            } else {
                resolve(false);
            }
        }, error => {
            reject(error);
        });
    });
}

// add an item
function addItemToShoopingList(item) {
    let itemID = item[0]
    let itemValue = item[1]
    let { name, quantity, type } = itemValue;
    // console.log(itemValue)

    let itemName = document.createElement('span')
    itemName.textContent = `${name}`
    let itemQuantity = document.createElement('span')
    itemQuantity.classList.add('quantity-item')
    itemQuantity.textContent = `${quantity}${type}`

    let newItem = document.createElement('li')
    
    let itemDetails = document.createElement('p')
    itemDetails.classList.add('item-details')
    itemDetails.appendChild(itemName)
    itemDetails.appendChild(itemQuantity)

    let icon = document.createElement('i')
    icon.classList.add('fas', 'fa-trash')

    newItem.append(itemDetails, icon)
    
    icon.addEventListener('click', function(){
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)
        remove(exactLocationOfItemInDB)
    })
    
    shoppingList.append(newItem)
}

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
        clearShoopingList()
        
        const textList = document.createElement('span')
        textList.classList.add('textList')
        textList.textContent = "No items here... yet"
        shoppingList.appendChild(textList)
    }
})

function clearShoopingList(){
    shoppingList.innerHTML = ''
}

function clearInputField() {
    inputField.value = ''
    inputQuantity.value = ''
    inputType.value = ''
}