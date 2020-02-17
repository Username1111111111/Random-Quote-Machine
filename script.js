if (!('fetch' in window)) {
  console.log('Fetch API not found, try including the polyfill');
}

window.onload = function() {
  var myQuotesJSON;
  var numberOfQuotesInJSON;
  getQuotes();
  canvasGen();
  newBackground();
}

document.getElementById("new-quote").onclick = () => { newQuote(); canvasGen(); newBackground(); };
document.getElementById("tweet-quote").onclick = () => { tweetQuote() };

window.addEventListener('resize', canvasGen, false);

// setInterval( () => { canvasGen(); }, 1000);

function getRandomQuoteNumber(numberOfQuotesInJSON) {
  let cryptoArr = new Uint32Array(1); //generating empty typed array (unsigned integer 0 to 4294967295) to fill with random numbers
  window.crypto.getRandomValues(cryptoArr); //filling in with random numbers
  let randomNumber = cryptoArr[0] / (0xffffffff + 1); //floating point "magic"
  // let min = Math.ceil(0); //avoiding floating point errors
  let min = 0;
  let max = Math.floor(numberOfQuotesInJSON); //avoiding floating point errors
  randomNumber = Math.floor(randomNumber * (max - min + 1)) + min; // randomNumberInFloatingVariation * (amountOfQuotes + 1)
  return randomNumber;
}

function getQuotes() {
  fetch("https://raw.githubusercontent.com/Username1111111111/Random-Quote-Machine/master/quotes.txt")
  .then( function(response) {
    return response.json()
  })
  .then(function(data) {
  	myQuotesJSON = data;
    numberOfQuotesInJSON = data.length;
    let randomQuoteNumber = getRandomQuoteNumber(numberOfQuotesInJSON);
    let firstQuote = data[randomQuoteNumber].text;
    let firstAuthor = data[randomQuoteNumber].author;
    document.getElementById("text").innerHTML = firstQuote;
    if (firstAuthor == null) {
      document.getElementById("author").innerHTML = "Someone";
    }
    else {
      document.getElementById("author").innerHTML = firstAuthor;
    }
  });
}

function newQuote() {
  let randomQuoteNumber = getRandomQuoteNumber(numberOfQuotesInJSON);
  let newQuote = myQuotesJSON[randomQuoteNumber].text;
  let newAuthor = myQuotesJSON[randomQuoteNumber].author;
  document.getElementById("text").innerHTML = newQuote;
  
  // let text = document.getElementById("author");
  // animateCSS('#author', 'pulse');
  // setTimeout( () => { 
  //   text.classList.remove("pulse");
  // }, 1100);
  
  if (newAuthor == null) {
    document.getElementById("author").innerHTML = "Someome";
  }
  else {
    document.getElementById("author").innerHTML = newAuthor;
  }

}

function tweetQuote() {
  let tweetUrlPart1 = "https://twitter.com/intent/tweet?&text=";
  let text = document.getElementById("text").innerHTML;
  let author = document.getElementById("author").innerHTML;
  let tweetUrlPart2 = encodeURIComponent('"' + text + '" (c) ' + author);
  let tweetUrl = tweetUrlPart1 +  tweetUrlPart2;
  window.open(tweetUrl, "theFrame");
  // .then(document.body.querySelector('input.button.selected.submit').click());
}


//----------------------------------------------------------------------------


//generates value from 0 to 255 randomly in non-secure way
function getRandomValue(min, max) {
  let min1 = Math.ceil(min);
  let max1 = Math.floor(max);
  return Math.floor( Math.random() * (max1 - min1 + 1) ) + min1;
}


//generates random color of pixel
function generateRGBA() {
  let r = getRandomValue(0, 255);
  let g = getRandomValue(0, 255);
  let b = getRandomValue(0, 255);
  let a = 255;
  return [r, g, b, a];
}


//generates canvas background image
function canvasGen() {
  let canvas = document.getElementById('myCanvas');
  let context = canvas.getContext('2d');
  let cHeight = window.innerHeight;
  let cWidth = window.innerWidth;
  document.getElementById('myCanvas').setAttribute("height", cHeight);
  document.getElementById('myCanvas').setAttribute("width", cWidth);
  drawInsideCanvas(context, cWidth, cHeight);
}


//draws canvas image and puts it to canvas "context"
function drawInsideCanvas(context, cWidth, cHeight) {
  let pic = context.getImageData(0, 0, cWidth, cHeight);
  let partsArr = splitScreen(cWidth, cHeight);
  
  let newPartsArr = [];
  newPartsArr[0] = [0];
  newPartsArr[1] = [0];

  for (let i = 0; i < 2; i++) {
    partsArr[i].reduce(
      function (accumulator, currentValue, index, array) {
        newPartsArr[i][index] = accumulator + currentValue;
        return accumulator + currentValue;
      }, 0
    );
  }
  


  let colorArr = new Array(partsArr[0].length).fill(0).map(() => new Array(partsArr[1].length).fill(0)); // 2d array creation trick
    
  //filling 2d array of sector colors
  for (let w = 0; w < partsArr[0].length; w++) {
    for (let h = 0; h < partsArr[1].length; h++) {
      colorArr[w][h] = generateRGBA();
    }
  }

  //for absolute random evry pixel coloring
  // for (let i = 0; i < pic.data.length; i += 4 ) {
  //   color = generateRGBA(); 
  //   colorPixel(i, pic, color);
  // }

  for (let i = 0, partNumberInWidthArr = 0, partNumberInHeightArr = 0, color, bias = 1, horPix = 0; i < pic.data.length; i += 4) {
     
    // if (horizontal pixel amount counter) divided by (amount of pixels of horizontal block) is equal to 1
    if ( horPix / (newPartsArr[0][partNumberInWidthArr] - bias)  == 1) {
      
      //if current block is last then start from first and null horizontal counter
      if (partNumberInWidthArr == newPartsArr[0].length - 1) {
        partNumberInWidthArr = 0;
        horPix = 0; 
      }
      else {
        partNumberInWidthArr++;
      }
    }
    
    //if (current pixel number) divided by (width) is equal (amount of pixels of vertical block)
    if ( (i/4) / ( newPartsArr[0][newPartsArr[0].length - 1]) == newPartsArr[1][partNumberInHeightArr] ) {
      partNumberInHeightArr++;
    }
    
    //define current color and paint pixels
    color = colorArr[partNumberInWidthArr][partNumberInHeightArr];
    colorPixel(i, pic, color);
    horPix++;
  }
  
  //set computed image
  context.putImageData(pic, 0, 0);
}


//generates background of quote-box
function newBackground() {
  let color = generateRGBA();
  document.getElementById("quote-box").style.background = `rgb( ${color[0]}, ${color[1]}, ${color[2]} )`;
}


//coloring pixel
function colorPixel(i, pic, color) {
  pic.data[i] = color[0];
  pic.data[i + 1] = color[1];
  pic.data[i + 2] = color[2];
  pic.data[i + 3] = color[3];
}


//calculating sectors for differenet colowing
function splitScreen(widthPx, heightPx) {
  let horizontalParts = 16;
  let verticalParts = 9;
  let pixelsPerPartHorizontaly;
  let pixelsPerPartVerticaly;
  let pixWidthOfPartsArr = [];
  let pixHeightOfPartsArr = [];
  
  //calculating pixels per 1 part
  //if all parts are equal of pixels - just divide by amount of parts
  //if not - divide (all minus amount of remainder) by amount of parts and then spread remainder 1 by 1 pixel of remainder per part
  if (widthPx % horizontalParts == 0) {
    pixelsPerPartHorizontaly = widthPx / horizontalParts;
    let basicPartPixWidth = widthPx / horizontalParts;
    for (let i = horizontalParts; i > 0; i--) {
      pixWidthOfPartsArr.push(basicPartPixWidth);
    }
  }
  else {
    let horizontalPixelRemainder = widthPx % horizontalParts;
    let basicPartPixWidth = (widthPx - horizontalPixelRemainder) / horizontalParts;
    
    for (let i = horizontalParts; i > 0; i--) {
      if (horizontalPixelRemainder != 0) {
        pixWidthOfPartsArr.push(basicPartPixWidth + 1);
        horizontalPixelRemainder -= 1;
      }
      else {
        pixWidthOfPartsArr.push(basicPartPixWidth);
      }
    }
  }
  
  //calcuclations for height
  if (heightPx % verticalParts == 0) {
    pixelsPerPartVerticaly = heightPx / verticalParts;
    let basicPartPixHeight = heightPx / verticalParts;
    for (let i = verticalParts; i > 0; i--) {
      pixHeightOfPartsArr.push(basicPartPixHeight);
    }
  }
  else {
    let verticalPixelRemainder = heightPx % verticalParts;
    let basicPartPixHeight = (heightPx - verticalPixelRemainder) / verticalParts;

    for (let i = verticalParts; i > 0; i--) {
      if (verticalPixelRemainder != 0) {
        pixHeightOfPartsArr.push(basicPartPixHeight + 1);
        verticalPixelRemainder -= 1;
      }
      else {
        pixHeightOfPartsArr.push(basicPartPixHeight);
      }
    }
  }
  
  return [pixWidthOfPartsArr, pixHeightOfPartsArr];
}


function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}