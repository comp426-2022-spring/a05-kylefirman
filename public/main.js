// Focus div based on nav button click
function btnSelect(selector){
    document.getElementById('home').setAttribute("class", "hidden")
    document.getElementById('single').setAttribute("class", "hidden")
    document.getElementById('multi').setAttribute("class", "hidden")
    document.getElementById('guess').setAttribute("class", "hidden")
    document.getElementById(selector).setAttribute("class", "active")
}
// Flip one coin and show coin image to match result when button clicked
const coin = document.getElementById("coin")
// Add event listener for coin button
			coin.addEventListener("click", flipCoin)
			function flipCoin() {
                
                fetch('http://localhost:5555/app/flip/', {mode: 'cors'})
  				.then(function(response) {
    			  return response.json();
  				})
				.then(function(result) {
					console.log(result);
					document.getElementById("flipCoinRes").innerHTML = result.flip;
					document.getElementById("quarter").setAttribute("src", "assets/img/" + result.flip+".png");
					coin.disabled = true
				})
				let flip = "FLIPPED"
				document.getElementById("coin").innerHTML = flip;
				console.log("Coin has been flipped. Result: "+ flip)
			}
// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series

// Guess a flip by clicking either heads or tails button

// Our flip many coins form
const coins = document.getElementById("coins")
// Add event listener for coins form
coins.addEventListener("submit", flipCoins)
// Create the submit handler
async function flipCoins(event) {
    event.preventDefault();
    
    const endpoint = "app/flip/coins/"
    const url = document.baseURI+endpoint

    const formEvent = event.currentTarget

    try {
        const formData = new FormData(formEvent);
        const flips = await sendFlips({ url, formData });

        console.log(flips);
        document.getElementById("heads").innerHTML = "Heads: "+flips.summary.heads;
        document.getElementById("tails").innerHTML = "Tails: "+flips.summary.tails;
    } catch (error) {
        console.log(error);
    }
}
// Create a data sender
async function sendFlips({ url, formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJson = JSON.stringify(plainFormData);
    console.log(formDataJson);

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: formDataJson
    };

    const response = await fetch(url, options);
    return response.json()
}

function guessFunc(guess){
    fetch('http://localhost:5555/app/flip/call')
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        console.log(result);

        document.getElementById("guessImg").setAttribute("src", "./assets/img/"+result.call+".png"); // change image
        document.getElementById("actualImg").setAttribute("src", "./assets/img/"+result.flip+".png");
        document.getElementById("guessRes").innerHTML = result.result; // change result text
    })
}
