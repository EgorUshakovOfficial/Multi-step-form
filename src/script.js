// Elements by Id
const confirmation = document.getElementById('confirmation');
const summary = document.getElementById('summary');
const selectPlan = document.getElementById('select-plan');
const personalInfo = document.getElementById('personal-info');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneNumInput = document.getElementById('phone-number');
const personalNextBtn = document.getElementById('personal-next-btn');
const selectPlanGoBack = document.getElementById('select-plan-go-back');
const baseMonthlyPlans = document.getElementById('billing-plans-monthly');
const baseYearlyPlans = document.getElementById('billing-plans-yearly');
const toggleSwitch = document.getElementById('monthly-yearly-checkbox');
const addOnsMonthlySection = document.getElementById('add-ons-monthly');
const addOnsYearlySection = document.getElementById('add-ons-yearly');
const summaryTableMonthly = document.getElementById('summary-table-monthly');
const summaryTableYearly = document.getElementById('summary-table-yearly');
const basePlanMonthlySelected = document.getElementById('base-plan-monthly-selected');
const basePlanYearlySelected = document.getElementById('base-plan-yearly-selected');
const basePriceMonthlySelected = document.getElementById('base-price-monthly-selected');
const basePriceYearlySelected = document.getElementById('base-price-yearly-selected');
const totalSpan = document.getElementById('total');
const summaryAddOnsMonthly = document.getElementById('summary-add-ons-monthly');
const summaryAddOnsYearly = document.getElementById('summary-add-ons-yearly');

// Elements by class
const sections = [...document.getElementsByClassName('section')];
const personalInfoFormGroups = document.getElementsByClassName('form-group');
const stepNums = [...document.getElementsByClassName('step-number')];
const billingMonthlyDiv = document.getElementsByClassName('billing-monthly')[0];
const billingYearlyDiv = document.getElementsByClassName('billing-yearly')[0];

// Elements by query selectors
const checkedInput = document.querySelector('.billing-option:checked');

// Elements by children
const billingMonthlyPlans = baseMonthlyPlans.children;
const billingYearlyPlans = baseYearlyPlans.children;
const addOnsMonthly = addOnsMonthlySection.children;
const addOnsYearly = addOnsYearlySection.children;

// Base plan look up table
const basePriceLookup = {
    'arcade-monthly': 9,
    'advanced-monthly': 12,
    'pro-monthly': 15,
    'arcade-yearly': 90,
    'advanced-yearly':120,
    'pro-yearly': 150
};

// Add-ons table lookup
const addOnsLookup = {
    'online-service-monthly':{selected:false, price: 1},
    'online-service-yearly':{selected: false, price: 10},
    'larger-storage-monthly':{selected:false, price: 2},
    'larger-storage-yearly':{selected: false, price: 20},
    'customizable-profile-monthly':{selected:false, price:2},
    'customizable-profile-yearly':{selected:false, price:20}
};

// Monthly base price
let basePriceMonthly = 9;

// Yearly base price
let basePriceYearly = 90;

let total;

// Click callbacks
// Next button on click
const nextOnClick = () => {
    // Finds index of the visible section
    let index = sections.findIndex(section => /visible/.test(section.className));

    // Index of the next section
    let nextSectionIdx = index + 1;

    if (nextSectionIdx === 1){
        // Remove all the utility classes from the elements
        for (let formGroup of personalInfoFormGroups){
            // Removes red outline from the input element
            formGroup.children[1].classList.remove('outline-red');

            // Hides error message
            formGroup.children[0].children[0].classList.remove('visible');
        }

        // Empty inputs of the personal info section
        let emptyInputs = getEmptyPersonalInfoInputs();

        // One or more of the input fields are not filled out
        if (emptyInputs.length > 0){
            emptyInputs.forEach(input => {
                // Display required text in the form group
                input.classList.add('outline-red');

                // Display required text
                input.parentElement.children[0].children[0].classList.add('visible');
            })

            return;
        }
    }

    // Summary page
    else if (nextSectionIdx === 3){
        // Toggled is switched on-yearly subscription
        if (toggleSwitch.checked){
            // All yearly add-ons
            let yearlyAddOns = [...summaryAddOnsYearly.children];

            // Initially hide all of the add-ons
            yearlyAddOns.forEach(addOn => addOn.classList.add('hide'));

            // Yearly add-ons selected
            let selectedYearlyAddOns = Object
            .entries(addOnsLookup)
            .filter(([addOnKey, addOnValues]) => {
                return /yearly/i.test(addOnKey) && addOnValues.selected
            })
            .map(([addOnKey, addOnValues]) => addOnKey);

            // Calculates yearly total
            total = calcTotal(basePriceYearly, selectedYearlyAddOns);

            // Reveals all of the selected yearly add-ons
            selectedYearlyAddOns.forEach(selectedAddOnKey => {
                let keyWords = selectedAddOnKey.split('-');
                let index = yearlyAddOns.findIndex(addOn => {
                    let typeAddOn = addOn.children[0].innerHTML.toLowerCase().trim();
                    return (`${keyWords[0]} ${keyWords[1]}` === typeAddOn)
                });

                // Hides unselected yearly add-on
                yearlyAddOns[index].classList.remove('hide');
            })

            // Updates yearly total cost
            totalSpan.innerHTML = `$${total}/yr`;
        }

        // Otherwise, toggled is switched off-monthly subscription
        else{
            // All monthly add-ons
            let monthlyAddOns = [...summaryAddOnsMonthly.children];

            // Initially hide all of the add-ons
            monthlyAddOns.forEach(addOn => addOn.classList.add('hide'));

            // Monthly add-ons selected
            let selectedMonthlyAddOns = Object.entries(addOnsLookup)
            .filter(([addOnKey, addOnValues]) => {
                return /monthly/i.test(addOnKey) && addOnValues.selected
            })
            .map(([addOnKey, addOnValues]) => addOnKey);

            // Calculate monthly subscription
            total = calcTotal(basePriceMonthly, selectedMonthlyAddOns);

            // Reveals all of the selected monthly add-ons
            selectedMonthlyAddOns.forEach(selectedAddOnKey => {
                let keyWords = selectedAddOnKey.split('-');
                let index = monthlyAddOns.findIndex(addOn => {
                    let typeAddOn = addOn.children[0].innerHTML.toLowerCase().trim();
                    return (`${keyWords[0]} ${keyWords[1]}` === typeAddOn)
                });

                // Hides unselected monthly add-on
                monthlyAddOns[index].classList.remove('hide');
            })

            // Updates monthly total cost
            totalSpan.innerHTML = `$${total}/mo`;
        }
    }

    // Hides current section from the user
    sections[index].classList.remove('visible');

    // Reveals the next section
    sections[nextSectionIdx].classList.add('visible');

    // Remove step from current step
    stepNums[index].classList.remove('fill');

    // Fill in step in next step
    stepNums[nextSectionIdx].classList.add('fill');
}


// Go back
const goBackOnClick = () => {
    // Finds index of the active step number
    let index = stepNums.findIndex(stepNum => /fill/.test(stepNum.className));

    // Hides current section from the user
    sections[index].classList.remove('visible');

    // Reveals the personal info section
    sections[index-1].classList.add('visible');

    // Remove step from current step
    stepNums[index].classList.remove('fill');

    // Fill in step in previous step
    stepNums[index-1].classList.add('fill');
}


// Outlines monthly billing option
const selectMonthlyBillingOption = event => {
    // Remove blue outline from all of the elements
    for (let billingMonthlyPlan of billingMonthlyPlans){
        billingMonthlyPlan.classList.remove('checked')
    }

    // Checked billing plan
    let checkedBillingOption = event.target.parentElement.parentElement;

    // Base monthly plan selected
    let basePlan =  event.target.value;

    basePriceMonthly = basePriceLookup[basePlan];

    // Type of monthly subscription and billing plan selected
    let [typePlan, typeSubscription] = basePlan.split('-');

    // Update monthly base plan in span of the summary table
    basePlanMonthlySelected.innerHTML = getBasePlan(typePlan, typeSubscription);

    // Update monthly base price in the summary table
    basePriceMonthlySelected.innerHTML = `$${basePriceLookup[basePlan]}/mo`;

    // Outline checked billing option
    checkedBillingOption.classList.add('checked');
}

// Outlines yearly billing options
const selectYearlyBillingOption = event => {
    // Remove blue outline from all of the elements
    for (let billingYearlyPlan of billingYearlyPlans){
        billingYearlyPlan.classList.remove('checked')
    }

    // Checked billing plan
    let checkedBillingOption = event.target.parentElement.parentElement;

    // Outline checked billing option
    checkedBillingOption.classList.add('checked');

    // Base plan selected
    let basePlan = event.target.value;

    basePriceYearly = basePriceLookup[basePlan];

    // Type of yearly subscription and billing plan selected
    let [typePlan, typeSubscription] = basePlan.split('-');

    // Updates yearly base plan in span of the summary table
    basePlanYearlySelected.innerHTML = getBasePlan(typePlan, typeSubscription);

    // Updates yearly base price in the summary table
    basePriceYearlySelected.innerHTML = `$${basePriceLookup[basePlan]}/yr`;
}

// Outlines monthly add-ons
const selectAddOn = event => {
    // Active add-on
    let activeAddOn = event.target.parentElement;

    // Type of add on
    let typeAddOn = event.target.value;

    if (event.target.checked){
        //Selects current add-on
        addOnsLookup[typeAddOn].selected = true;

        // Outlines add-on selected in the Add-ons section
        activeAddOn.classList.add('checked');
    }

    else{
        // Unselects the current add-on
        addOnsLookup[typeAddOn].selected = false;

        // Removes outline from the current checked add-on
        activeAddOn.classList.remove('checked');
    }
}

const toggleBillingOptions = event => {
    let isBillingYearly = event.target.checked

    // Billing option selected by user is yearly
    if (isBillingYearly){
        // Hides the monthly billing plans
        baseMonthlyPlans.classList.add('hide');

        // Reveals the yearly billing plans
        baseYearlyPlans.classList.remove('hide');

        // Hides the monthly billing plans
        addOnsMonthlySection.classList.add('hide');

        // Reveals the yearly billing plans
        addOnsYearlySection.classList.remove('hide');

        // Hides the monthly summary table
        summaryTableMonthly.classList.add('hide');

        // Reveals the yearly billing plans
        summaryTableYearly.classList.remove('hide');

        // Highlights yearly billing option
        billingYearlyDiv.classList.add('dark-blue-highlight');

        // Removes highlight from monthly billing option
        billingMonthlyDiv.classList.remove('dark-blue-highlight');
    }

    // Otherwise, billing option selected is monthly
    else{
        // Hides the yearly billing plans
        baseYearlyPlans.classList.add('hide');

        // Reveals the monthly billing plans
        baseMonthlyPlans.classList.remove('hide');

        // Hides the yearly add ons
        addOnsYearlySection.classList.add('hide');

        // Reveals the monthly add ons
        addOnsMonthlySection.classList.remove('hide');

        // Hides the yearly summary table
        summaryTableYearly.classList.add('hide');

        // Reveals the monthly summary table
        summaryTableMonthly.classList.remove('hide');

        // Highlights monthly billing option
        billingMonthlyDiv.classList.add('dark-blue-highlight');

        // Removes yearly billing option
        billingYearlyDiv.classList.remove('dark-blue-highlight');
    }
}

// Change on click
const changeOnClick = () => {
    // Hides summary section
    summary.classList.remove('visible');

    // Reveals personal info section
    personalInfo.classList.add('visible');

    // Remove fill from fourth step
    stepNums[3].classList.remove('fill');

    // Fill in step in next step
    stepNums[0].classList.add('fill');

};

// Form on submit
const onSubmit = event => {
    // Stops form from being submitted to the server
    event.preventDefault();

    // Make some kind of fetch request...

    // Redirects to thank you message
    confirmation.classList.remove('hide');

    // Hide the summary section
    summary.classList.remove('visible');
}

// Services
const getEmptyPersonalInfoInputs = () => {
    // Inputs in personal info that are not filled out
    const emptyInputs = [];

    // Traverse through the collection of form groups
    for (let formGroup of personalInfoFormGroups){
        let input = formGroup.children[1];

        // Input value is empty
        if (input.value === ""){
            emptyInputs.push(input);
        }
    }

    return emptyInputs;
}

const getBasePlan = (typePlan, typeSubscription) => {
    return `${capitalizeWord(typePlan)} (${capitalizeWord(typeSubscription)})`;
}

const capitalizeWord = word => {
    return word[0].toUpperCase() + word.substring(1);
}

// Calculates total of base price and selected add-ons owed in either monthly or yearly basis
const calcTotal = (basePrice, selectedAddOns) => {
    return selectedAddOns.reduce((total, addOn) => total + addOnsLookup[addOn].price, basePrice);
}

