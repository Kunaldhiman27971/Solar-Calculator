const $ = (id) => document.getElementById(id);
const rupees = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;
const compactRupees = (value) => {
    const n = Math.round(value);
    if (n >= 10000000) {
        return `₹${(n / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
    }
    if (n >= 100000) {
        return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`;
    }
    return `₹${n.toLocaleString('en-IN')}`;
};

let years = 25;
let costWasManuallyEdited = false;

function getSuggestedSystemCost(bill) {
    if (bill <= 2000) return 220000;
    if (bill <= 5000) return 330000;
    return 430000;
}

function syncCostFromBill() {
    if (costWasManuallyEdited) return;
    const bill = Math.max(0, Number($('bill').value) || 0);
    $('cost').value = getSuggestedSystemCost(bill);
}

function calculate() {
    const bill = Math.max(0, Number($('bill').value) || 0);
    const coverage = 1;
    const growth = 0.05;
    const cost = Math.max(0, Number($('cost').value) || 0);
    const subsidy = Math.max(0, Number($('subsidy').value) || 0);

    const monthlySaving = bill * coverage;
    const firstYearSaving = monthlySaving * 12;
    const multiplier = growth === 0 ? years : (Math.pow(1 + growth, years) - 1) / growth;
    const totalSavings = firstYearSaving * multiplier;
    const finalYearSavings = firstYearSaving * Math.pow(1 + growth, years - 1);
    const netCost = Math.max(0, cost - subsidy);
    const paybackYears = netCost > 0 && firstYearSaving > 0 ? netCost / firstYearSaving : 0;
    const paybackMonths = paybackYears * 12;
    const returnPercent = netCost > 0 ? (totalSavings / netCost) * 100 : 0;
    const solarScore = Math.min(99, Math.round((coverage * 100) * 0.7 + (bill / 15000) * 30));

    $('billOut').textContent = rupees(bill);
    $('monthly').textContent = rupees(monthlySaving);
    $('annual').textContent = rupees(firstYearSaving);
    $('finalYear').textContent = rupees(finalYearSavings);
    $('netCost').textContent = rupees(netCost);
    $('total').textContent = rupees(totalSavings);
    $('payback').textContent = paybackYears > 0 ? (paybackYears < 1 ? `${Math.round(paybackMonths)} months` : `${paybackYears.toFixed(1).replace(/\.0$/, '')} years`) : 'N/A';
    $('roi').textContent = `${Math.round(returnPercent)}%`;
    $('heroCoverage').textContent = `${Math.round(coverage * 100)}%`;
    $('heroCoverageBar').style.width = `${Math.round(coverage * 100)}%`;
    $('solarScoreText').textContent = `${solarScore}/100`;
    $('scoreBar').style.width = `${solarScore}%`;
    $('heroTotal').textContent = compactRupees(totalSavings);
    $('heroSummary').textContent = `${rupees(monthlySaving)} monthly saving • ${years} year estimate`;

    const summary = [
        'AVS Solar estimate:',
        `Monthly bill ${rupees(bill)}`,
        `Estimated monthly saving ${rupees(monthlySaving)}`,
        `First-year saving ${rupees(firstYearSaving)}`,
        `Tariff increment assumption ${Math.round(growth * 100)}% per year`,
        `Estimated ${years}-year bill savings ${rupees(totalSavings)}`,
        `Estimated net system cost ${rupees(netCost)}`,
        `Estimated payback ${paybackYears > 0 ? (paybackYears < 1 ? `${Math.round(paybackMonths)} months` : `${paybackYears.toFixed(1).replace(/\.0$/, '')} years`) : 'N/A'}`,
        'Illustrative, not guaranteed.'
    ].join(' ');

    const waText = encodeURIComponent(
        [
            'Hello AVS Solar, please help me with a solar estimate.',
            `Monthly bill: ${rupees(bill)}`,
            `Estimated saving: ${Math.round(coverage * 100)}%`,
            `Yearly tariff increment assumption: ${Math.round(growth * 100)}%`,
            `Projection: ${years} years`,
            `Estimated long-term bill savings: ${rupees(totalSavings)}`,
            `Estimated payback: ${paybackYears > 0 ? (paybackYears < 1 ? `${Math.round(paybackMonths)} months` : `${paybackYears.toFixed(1).replace(/\.0$/, '')} years`) : 'N/A'}`,
            'Please arrange a consultation.'
        ].join('\n')
    );

    $('whatsapp').href = `https://wa.me/918091853310?text=${waText}`;

    $('share').onclick = async () => {
        try {
            await navigator.clipboard.writeText(summary);
            $('copyStatus').textContent = 'Estimate summary copied.';
        } catch (error) {
            $('copyStatus').textContent = summary;
        }
    };
}

['subsidy'].forEach((id) => {
    $(id).addEventListener('input', calculate);
});

$('bill').addEventListener('input', () => {
    if (!costWasManuallyEdited) {
        $('cost').value = getSuggestedSystemCost(Math.max(0, Number($('bill').value) || 0));
    }
    calculate();
});

$('cost').addEventListener('input', () => {
    costWasManuallyEdited = true;
    calculate();
});

document.querySelectorAll('[data-years]').forEach((button) => {
    button.addEventListener('click', () => {
        years = Number(button.dataset.years);
        document.querySelectorAll('[data-years]').forEach((item) => {
            item.classList.toggle('active', item === button);
        });
        calculate();
    });
});

$('year').textContent = new Date().getFullYear();
$('cost').value = getSuggestedSystemCost(Math.max(0, Number($('bill').value) || 0));
calculate();
