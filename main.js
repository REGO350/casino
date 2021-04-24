const SERVER_URL = "https://odn2hgteqiok.moralis.io:2053/server";
const APPLICATION_ID = "D0AXstFCUKQZ70du1Tg0U1zeiqMc9sJrmWkX5Abg";
var contractAddress = "0x10CcF9f4B1982C7A9354bfEae54785045F5dBCA5";

Moralis.initialize(APPLICATION_ID); // Application id from moralis.io
Moralis.serverURL = SERVER_URL; //Server url from moralis.io

function addRowToTable(tableId, data){
  let tableRow = document.createElement('tr');
  data.forEach(element =>{
    let newColumn = document.createElement('td');
    newColumn.innerHTML = element;
    tableRow.appendChild(newColumn);
  });
  document.getElementById(tableId).appendChild(tableRow);
}

async function login() {
  try {
    user = await Moralis.User.current();
    if(!user){
      user = await Moralis.Web3.authenticate();
    }
    console.log(user);
    document.getElementById("login_button").style.display = "none";
    document.getElementById("game").style.display = "block";
    document.getElementById("logout_button").style.display = "block";

    let biggestWinners = await Moralis.Cloud.run("biggestWinners", {});
    biggestWinners.forEach( (row) => {
      addRowToTable("top_winners", [row.objectId, row.total_sum]);
    });


    let biggestLosers = await Moralis.Cloud.run("biggestLosers", {});
    biggestLosers.forEach( (row) => {
      addRowToTable("top_losers", [row.objectId, row.total_sum]);
    });

    let biggestBets = await Moralis.Cloud.run("biggestBets", {});
    biggestBets.forEach( (row) => {
      addRowToTable("biggest_bets", [row.user, row.bet, row.win]);
    });

  } catch (error) {
    console.log(error);
  }
}

async function flip(side){
  let amount = document.getElementById("amount").value;
  window.web3 = await Moralis.Web3.enable();
  let contractInstance = new web3.eth.Contract(window.abi, contractAddress);
  contractInstance.methods.flip(side == "heads" ? 0 : 1).send({value: amount, from: ethereum.selectedAddress}).on('receipt', (receipt) =>{
    console.log(receipt);
    if(receipt.events.bet.returnValues.win){
      alert("you won!");
    }else{
      alert("you lost!");
    }
  })
}

async function logout(){
  await Moralis.User.logOut();
  document.getElementById("login_button").style.display = "block";
  document.getElementById("logout_button").style.display = "none";
  alert("logged out");
}

document.getElementById("login_button").onclick = login;
document.getElementById("logout_button").onclick = logout;
document.getElementById("heads_button").onclick = () => {flip("heads")};
document.getElementById("tails_button").onclick = () => {flip("tails")};