document.getElementById("submitNames").addEventListener("click", () => {
  const names = document
    .getElementById("peopleInput")
    .value.trim()
    .split("\n")
    .filter((name) => name);
  if (names.length > 0) {
    saveToLocalStorage("names", names);
    populateDropdown(names);
    document.getElementById("iouSection").classList.remove("hidden");
  }
});

// document.getElementById("submitIOU").addEventListener("click", () => {
//   const fromPerson = document.getElementById("fromPerson").value;
//   const toPerson = document.getElementById("toPerson").value;
//   const amount = document.getElementById("amount").value;
//   const description = document.getElementById("description").value;

// });

document.getElementById("cancelIOU").addEventListener("click", resetIOUForm);

// Call the function to load saved data
document.getElementById("clearAllBtn").addEventListener("click", function () {
  // Show confirmation alert
  if (confirm("Are you sure you want to delete all transactions?")) {
    // Clear the data storage (localStorage, array, or whatever you're using)
    // Use the correct key ('ious') to remove the transactions
    localStorage.removeItem("ious"); // This will remove the 'ious' key from localStorage

    // Clear the visible transactions on the page
    document.getElementById("transactionLog").innerHTML = "";

    // Optional: Show a confirmation message
    alert("All transactions have been cleared.");
  }
});
loadSavedData();
window.addEventListener("load", function () {
  loadSavedData(); // Load people and transactions
  createPeopleSummary(); // Create expandable sections for each person
});

// Event listener for adding a new transaction
document.getElementById("submitIOU").addEventListener("click", function () {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const description = document.getElementById("description").value;
  const date = new Date().toLocaleDateString();
  if (from && to && amount && description) {
    const iou = { from: from, to: to, amount, description };
    saveIOU(iou);
    addTransactionToLog(iou);
    resetIOUForm();
    createPeopleSummary();
  } else {
    alert("Please fill out all fields.");
  }
});

// Call the function to populate the people summary section
createPeopleSummary();

///// HELPER FUNCTIONS //////
function populateDropdown(names) {
  const fromDropdown = document.getElementById("from");
  const toDropdown = document.getElementById("to");

  fromDropdown.innerHTML = ""; // Clear previous options
  toDropdown.innerHTML = ""; // Clear previous options

  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    fromDropdown.appendChild(option);
  });

  fromDropdown.addEventListener("change", () => {
    const selectedName = fromDropdown.value;
    toDropdown.innerHTML = ""; // Clear previous options

    names
      .filter((name) => name !== selectedName)
      .forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        toDropdown.appendChild(option);
      });
  });

  fromDropdown.dispatchEvent(new Event("change")); // Trigger to initialize `toDropdown`
}
function resetIOUForm() {
  document.getElementById("from").value = "";
  document.getElementById("to").innerHTML = "";
  document.getElementById("amount").value = "";
  document.getElementById("description").value = "";
}

// Save data to localStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Retrieve data from localStorage
function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Save I.O.U to localStorage
function saveIOU(iou) {
  const ious = getFromLocalStorage("ious") || [];
  ious.push(iou);
  saveToLocalStorage("ious", ious);
}

// Add a transaction to the log
function addTransactionToLog(iou, index = null) {
  const logDiv = document.getElementById("transactionLog");

  // Get current date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "2-digit", // 2-digit month
    day: "2-digit", // 2-digit day
  });
  const logEntry = document.createElement("div");
  logEntry.classList.add("transaction-entry");

  // Include date in the transaction entry
  logEntry.innerHTML = `
    <span class="transaction-date">${formattedDate}</span>
    ${iou.from} owes ${iou.to} $${iou.amount} for ${iou.description}
    <span class="actions">
     <button class="edit" data-index="${index}">
  <i class="fas fa-pencil-alt" style="color: gray;"></i>
</button>
<button class="delete" data-index="${index}">
  <i class="fas fa-trash-alt"></i>
</button>
    </span>
  `;

  // Attach edit and delete handlers
  logEntry.querySelector(".delete").addEventListener("click", () => deleteTransaction(index));
  logEntry.querySelector(".edit").addEventListener("click", () => editTransaction(index));
  logDiv.appendChild(logEntry);
  createPeopleSummary();
}

// Delete a transaction
function deleteTransaction(index) {
  let ious = getFromLocalStorage("ious");
  ious.splice(index, 1); // Remove the selected transaction
  saveToLocalStorage("ious", ious);
  loadTransactionLog(); // Reload the log
}

// Edit a transaction
function editTransaction(entryDiv, index) {
  const ious = getFromLocalStorage("ious");
  const iou = ious[index];

  entryDiv.innerHTML = ""; // Clear the current entry

  // Create editable fields
  const fromDropdown = document.createElement("select");
  const toDropdown = document.createElement("select");
  const amountInput = document.createElement("input");
  const descriptionInput = document.createElement("input");
  const okButton = document.createElement("button");
  const cancelButton = document.createElement("button");

  // Populate dropdowns
  const names = getFromLocalStorage("names") || [];
  names.forEach((name) => {
    const fromOption = document.createElement("option");
    fromOption.value = name;
    fromOption.textContent = name;
    fromDropdown.appendChild(fromOption);

    const toOption = document.createElement("option");
    toOption.value = name;
    toOption.textContent = name;
    toDropdown.appendChild(toOption);
  });

  fromDropdown.value = iou.from;
  toDropdown.innerHTML = ""; // Populate 'to' dropdown dynamically
  names
    .filter((name) => name !== iou.from)
    .forEach((name) => {
      const toOption = document.createElement("option");
      toOption.value = name;
      toOption.textContent = name;
      toDropdown.appendChild(toOption);
    });
  toDropdown.value = iou.to;

  // Populate input fields
  amountInput.type = "number";
  amountInput.value = iou.amount;
  amountInput.min = "0";
  amountInput.step = "0.01";

  descriptionInput.type = "text";
  descriptionInput.value = iou.description;
  descriptionInput.maxLength = "100";

  okButton.textContent = "OK";
  cancelButton.textContent = "Cancel";

  // Append inputs and buttons
  entryDiv.appendChild(fromDropdown);
  entryDiv.appendChild(document.createTextNode(" owes "));
  entryDiv.appendChild(toDropdown);
  entryDiv.appendChild(amountInput);
  entryDiv.appendChild(document.createTextNode(" for "));
  entryDiv.appendChild(descriptionInput);
  entryDiv.appendChild(okButton);
  entryDiv.appendChild(cancelButton);

  // OK button functionality
  okButton.addEventListener("click", () => {
    const updatedIOU = {
      from: fromDropdown.value,
      to: toDropdown.value,
      amount: amountInput.value,
      description: descriptionInput.value,
    };

    if (updatedIOU.from && updatedIOU.to && updatedIOU.amount && updatedIOU.description) {
      ious[index] = updatedIOU; // Update the transaction in memory
      saveToLocalStorage("ious", ious); // Save changes

      // Replace only the current line with plain text
      entryDiv.innerHTML = `
        ${updatedIOU.from} owes ${updatedIOU.to} $${updatedIOU.amount} for ${updatedIOU.description}
        <span class="actions">
         <button class="edit" data-index="${index}">
  <i class="fas fa-pencil-alt" style="color: gray;"></i>
</button>
<button class="delete" data-index="${index}">
  <i class="fas fa-trash-alt"></i>
</button>
        </span>
      `;

      // Reattach edit and delete handlers
      entryDiv.querySelector(".edit").addEventListener("click", () => editTransaction(entryDiv, index));
      entryDiv.querySelector(".delete").addEventListener("click", () => deleteTransaction(index));
    } else {
      alert("Please fill out all fields.");
    }
  });

  // Cancel button functionality
  cancelButton.addEventListener("click", () => {
    // Revert only the current line to its original state
    entryDiv.innerHTML = `
      ${iou.from} owes ${iou.to} $${iou.amount} for ${iou.description}
      <span class="actions">
        <button class="edit" data-index="${index}">
  <i class="fas fa-pencil-alt" style="color: gray;"></i>
</button>
<button class="delete" data-index="${index}">
  <i class="fas fa-trash-alt"></i>
</button>
      </span>
    `;

    // Reattach edit and delete handlers
    entryDiv.querySelector(".edit").addEventListener("click", () => editTransaction(entryDiv, index));
    entryDiv.querySelector(".delete").addEventListener("click", () => deleteTransaction(index));
  });

  // Dynamically update 'to' dropdown when 'from' is changed
  fromDropdown.addEventListener("change", () => {
    const selectedFrom = fromDropdown.value;
    toDropdown.innerHTML = ""; // Clear 'to' dropdown
    names
      .filter((name) => name !== selectedFrom)
      .forEach((name) => {
        const toOption = document.createElement("option");
        toOption.value = name;
        toOption.textContent = name;
        toDropdown.appendChild(toOption);
      });
  });
  createPeopleSummary();
}

// Load all saved transactions into the log
function loadTransactionLog() {
  const ious = getFromLocalStorage("ious") || [];
  const logDiv = document.getElementById("transactionLog");
  logDiv.innerHTML = ""; // Clear existing log

  ious.forEach((iou, index) => addTransactionToLog(iou, index));
}

// Load saved data on page load
function loadSavedData() {
  const names = getFromLocalStorage("names");
  if (names) {
    document.getElementById("peopleInput").value = names.join("\n");
    populateDropdown(names);
    document.getElementById("iouSection").classList.remove("hidden");
  }
  loadTransactionLog(); // Load saved transactions
}

// Toggle the visibility of the transaction details
function toggleTransactions(person) {
  const ious = getFromLocalStorage("ious") || [];
  const transactionsDiv = document.getElementById(`transactions-${person}`);

  // If the section is already visible, collapse it
  if (transactionsDiv) {
    transactionsDiv.style.display = transactionsDiv.style.display === "none" ? "block" : "none";
  } else {
    // Otherwise, create a new section for the transactions
    const newTransactionsDiv = document.createElement("div");
    newTransactionsDiv.id = `transactions-${person}`;
    newTransactionsDiv.classList.add("transaction-details");

    // Filter the transactions where the person is the "from" (i.e., owes money)
    const personTransactions = ious.filter((iou) => iou.from === person);
    personTransactions.forEach((iou, index) => {
      const transactionDiv = document.createElement("div");
      transactionDiv.classList.add("transaction-entry");

      transactionDiv.innerHTML = `
        ${iou.from} owes ${iou.to} $${iou.amount} for ${iou.description}
        <span class="actions">
          <button class="edit" data-index="${index}">
            <i class="fas fa-pencil-alt" style="color: gray;"></i>
          </button>
          <button class="delete" data-index="${index}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </span>
      `;

      // Attach event listeners to edit and delete buttons
      transactionDiv.querySelector(".delete").addEventListener("click", () => deleteTransaction(index));
      transactionDiv.querySelector(".edit").addEventListener("click", () => editTransaction(transactionDiv, index));

      newTransactionsDiv.appendChild(transactionDiv);
    });

    document.getElementById("peopleSummary").appendChild(newTransactionsDiv);
  }
}

function groupTransactionsByPerson() {
  const ious = getFromLocalStorage("ious") || [];
  const grouped = {};

  ious.forEach((iou) => {
    const { from, to, amount, description, date } = iou;

    // Group by 'from' (the person owing money)
    if (!grouped[from]) {
      grouped[from] = [];
    }

    grouped[from].push({ to, amount, description, date });
  });

  return grouped;
}
function createPeopleSummary() {
  console.log("createPeopleSummary");
  const peopleSummaryDiv = document.getElementById("peopleSummary");
  console.log("peopleSummaryDiv", peopleSummaryDiv);
  peopleSummaryDiv.innerHTML = ""; // Clear existing summary

  const groupedTransactions = groupTransactionsByPerson();
  console.log("groupedTransactions", groupedTransactions);

  for (const person in groupedTransactions) {
    const transactions = groupedTransactions[person];
    const totalOwed = transactions.reduce((total, transaction) => total + transaction.amount, 0);

    // Create the collapsed header
    const summaryTile = document.createElement("div");
    summaryTile.classList.add("person-summary-tile");
    summaryTile.id = `tile-${person}`;

    const tileHeader = document.createElement("div");
    tileHeader.classList.add("tile-header");
    tileHeader.innerHTML = `${person} owes $${totalOwed.toFixed(2)}  <span class="expand-collapse-btn"></span>`;

    // Add the tile header to the tile
    summaryTile.appendChild(tileHeader);

    // Create the expanded content with transaction details (hidden initially)
    const transactionDetails = document.createElement("div");
    transactionDetails.classList.add("transaction-details");
    transactionDetails.style.display = "none"; // Initially collapsed

    transactions.forEach((transaction) => {
      const transactionDiv = document.createElement("div");
      transactionDiv.classList.add("transaction-entry");
      transactionDiv.innerHTML = `${transaction.date} ${person} owes ${transaction.to} $${transaction.amount} for ${transaction.description}`;
      transactionDetails.appendChild(transactionDiv);
    });

    // Add the transaction details to the tile
    summaryTile.appendChild(transactionDetails);

    // Add the tile to the summary section
    peopleSummaryDiv.appendChild(summaryTile);

    // Add the expand/collapse functionality
    // tileHeader
    //   .querySelector(".expand-collapse-btn")
    //   .addEventListener("click", () => toggleTransactions(person, transactionDetails, tileHeader));
    tileHeader.querySelector(".expand-collapse-btn").addEventListener("click", (event) => {
      // Toggle transactions and expand/collapse button state
      const btn = event.currentTarget;
      toggleTransactions(person, transactionDetails, tileHeader);
      btn.classList.toggle("expanded");
    });
    updateOwedInfo(person, tileHeader, transactions);
  }
}

function toggleTransactions(person, transactionDetails, tileHeader) {
  const isExpanded = transactionDetails.style.display === "block";

  // Toggle the display of the transaction details
  transactionDetails.style.display = isExpanded ? "none" : "block";

  // // Change the expand/collapse button to show the appropriate icon
  // tileHeader.querySelector(".expand-collapse-btn").textContent = isExpanded ? "v" : "^";
}
function updateOwedInfo(person, tileHeader, transactions) {
  let totalOwed = 0;
  let details = [];

  // Calculate total owed and individual amounts
  transactions.forEach((transaction) => {
    if (transaction.from === person) {
      totalOwed += transaction.amount;
      details.push(`<span>${transaction.to}: $${transaction.amount.toFixed(2)}</span>`);
    }
  });

  // Format the info to show in the titleHeader
  const owedText = details.length > 0 ? `<div class="owed-details">${details.join("<br>")}</div>` : "";

  tileHeader.querySelector(".expand-collapse-btn").innerHTML = `
    <span class="person-name">${person} owes <strong>$${totalOwed.toFixed(2)}</strong></span>
    ${owedText}
  `;
}


