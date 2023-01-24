'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


/////////////////////////////////////////////////
// Functions


const formatCur = (value, locale, curr) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr
  }).format(value);
}

/**
 * Funcion que permite mostrar los movimientos (array) de un usuario (de ultimos a primeros)
 * @param {*} movements 
 */
const displayMovements = (acc, sort = false) => {

  containerMovements.innerHTML = ''; 

  const movs = sort ? acc.movements.slice().sort((a,b) => a - b ) : acc.movements;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const day = `${date.getDate()}`.padStart(2,0);
    const month = `${date.getMonth() +1}`.padStart(2,0);
    const year = date.getFullYear();
    const displayDate = `${day}/${month}/${year}`;

   

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formatCur(mov.toFixed(2), acc.locale, acc.currency)}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);

  });
}

/**
 * Función para obtener el balance de la cuenta
 * acc es el acumulador y mov el movimiento
 * @param {*} movements 
 */
 const calcPrintBalance = (acc) => {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
}


/**
 * Funcion para obtener los resumenes de todo
 */
const calcDisplaySummary = (acc) => {
  const incomes = acc.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const outcomes = acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov);
  labelSumOut.textContent = formatCur(Math.abs(outcomes), acc.locale, acc.currency);

  const interest = acc.movements.filter(mov => mov > 0).map(mov => mov * acc.interestRate/100).filter(mov => mov >= 1).reduce((acc, mov) => acc + mov);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency); 

}


/**
 * Función para crear los nombres de usuarios
 * @param {*} accs 
 */
const createUsernames = (accs) => {
  accs.forEach(acc => {
    acc.username = acc.owner.toLowerCase().split(' ').map((name) =>  name[0]).join('')
  })
}

createUsernames(accounts);

/**
 * Actualización del UI
 * @param {*} currentAccount 
 */
const updateUI = (currentAccount) => {
  displayMovements(currentAccount);
  calcPrintBalance(currentAccount);
  calcDisplaySummary(currentAccount);
}


const startLogOutTimer = () => {

  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    labelTimer.textContent = `${min}:${sec}`;
    
    if(time === 0){
      clearInterval(timer);
      labelWelcome.textContent = `Inicia sesión para comenzar`;
      containerApp.style.opacity = 0;
    }

    time--;
  }

  let time = 300;

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

////////////////////////////////////
// Event handlers


let currentAccount, timer;


btnLogin.addEventListener('click', (e) => {
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  
  if(currentAccount?.pin === +(inputLoginPin.value)){
    // mensaje de bienvenida
    labelWelcome.textContent = `Bienvenido/a, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;

    // mostrar la fecha
    const now = new Date();
    const day = `${now.getDate()}`.padStart(2,0);
    const month = `${now.getMonth() +1}`.padStart(2,0);
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2,0);
    const min = `${now.getMinutes()}`.padStart(2,0);
    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    //ocultar la info del login
    inputLoginUsername.value = inputLoginPin.value = "";
    inputClosePin.blur();

    if(timer) clearInterval(timer);
    timer = startLogOutTimer();

    // mostrar los movimientos, el balance y el resumen
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', (e) => {
  e.preventDefault();
  const amount = +(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);

  if(amount > 0 && receiverAcc && currentAccount.balance - amount > 0 && receiverAcc?.username !== currentAccount.username ){
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    //ocultar la info
    inputTransferAmount.value = inputTransferTo.value = "";
    inputTransferTo.blur();

    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', (e) => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if(amount > 0 && currentAccount.movements.some(m => m >= amount / 10 )){
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500)
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', (e) => {
  e.preventDefault();

  if(inputCloseUsername.value === currentAccount.username && +(inputClosePin.value) === currentAccount.pin){
    const index = accounts.findIndex(acc => acc.username == inputCloseUsername.value);

    // elimino el usuario
    accounts.splice(index, 1);

    // oculto todo
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = "";
  }
});

let sorted = false;
btnSort.addEventListener('click', (e) => {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

