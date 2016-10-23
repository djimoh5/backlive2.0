export const TABLE_MAP: string[] = [ "", "is", "bs", "cf", "snt", "mos", "tech", "macro", "shrt_intr", "is_gr", "fs", "fi" ];

export const NO_VALUE = -99999;

export const FIELD_MAP = {
    1: { 
    'sales':'sales', 
    'netinc':'net income', 
    'cgs':'cost of goods', 
    'gross':'gross income', 
    'rd':'R&D', 
    'totexp':'total expenses', 
    'dep':'depreciation', 
    'int':'interest expense', 
    'othinc':'other income', 
    'uninc':'unusual expense', 
    'gopinc':'operating income', 
    'intno':'interest expense non-op', 
    'pti':'pre-tax income', 
    'inctax':'income tax',
    'nit':'income after taxes', 
    'xord':'nonrecurring items', 
    'iac':'net income ex-items', 
    'epscon':'EPS cont.', 
    'eps':'EPS', 
    'epsd':'EPS diluted', 
    'epsdc':'EPS diluted cont.', 
    'dps':'dividends per share' 
    },
    2: { 
    'equity':'total equity', 
    'ar':'receivables', 
    'inv':'inventory', 
    'oca':'other current assets', 
    'ca':'current assets', 
    'nppe':'Net PP&E', 
    'gwi':'intangibles', 
    'olta':'other long-term assests', 
    'assets':'total assets', 
    'ap':'payables', 
    'stdebt':'short-term debt', 
    'ocl':'other current liabilities', 
    'cl':'current liabilities', 
    'ltdebt':'long-term debt',
    'oltl':'other long-term liabilities', 
    'liab':'total liabilities', 
    'pref':'preferred stock', 
    'totloe':'total liabilities & equity', 
    'shr':'shares out', 
    'cash':'cash' },
    3: { 
    'dep_cf':'depreciation', 
    'tco':'cash from operations', 
    'ce':'capex', 
    'tci':'cash from investing', 
    'dps':'dividends per share', 
    'tcf':'cash from financing', 
    'ere':'exchange rate effects', 
    'ncc':'net change in cash' 
    },
    4: { 
    'price':'price', 
    'mktcap':'market cap', 
    'shr_ay1':'shares out', 
    'avd_10d':'avg. volume', 
    'shrinst':'inst. own', 
    'instps':'inst. buys', 
    'instss':'inst. sells', 
    'shrinsd':'insider own',
    'insdps':'insider buys', 
    'insdss':'insider sells', 
    'priceh_52w':'52 wk high', 
    'pricel_52w':'52 wk low', 
    'prchg_04w':'Price Chng 4wk', 
    'prchg_13w':'Price Chng 13wk',
    'prchg_26w':'Price Chng 26wk', 
    'prchg_52w':'Price Chng 52wk', 
    'eps_eq0':'eps est. qtr', 
    'epspm_eq0':'eps est. qtr month ago', 
    'epsn_eq0':'# of est. qtr', 
    'eps_ey0':'eps est. yr', 
    'epspm_ey0':'eps est. yr month ago', 
    'epsn_ey0':'# of est. yr', 
    'eps_eq1':'eps est. next qtr', 
    'epspm_eq1':'eps est. next qtr month ago', 
    'epsn_eq1':'# of est. next qtr',
    'eps_ey1':'eps est. next yr', 
    'epspm_ey1':'eps est. next yr month ago', 
    'epsn_ey1':'# of est. next yr', 
    'epsum_eq0':'# up eps est. qtr', 
    'epsum_eq1':'# up eps est. next qtr',
    'epsdm_eq0':'# down eps est. qtr', 
    'epsdm_eq1':'# down eps est. next qtr', 
    'epsum_ey0':'# up eps est. yr', 
    'epsum_ey1':'# up eps est. next yr', 
    'epsdm_ey0':'# down eps est. yr', 
    'epsdm_ey1':'# down eps est. next yr',
    'eps3m_eq0':'eps est. qtr 3m ago', 
    'eps3m_eq1':'eps est. next qtr 3m ago', 
    'eps3m_ey0':'eps est. yr 3m ago', 
    'eps3m_ey1':'eps est. next yr 3m ago',
    'epssd_eq0':'eps est. std qtr', 
    'epsh_eq0':'eps est. high qtr', 
    'epsl_eq0':'eps est. low qtr', 
    'epssd_ey0':'eps est. std yr', 
    'epsh_ey0':'eps est. high yr', 
    'epsl_ey0':'eps est. low yr',
    'epssd_eq1':'eps est. std next qtr', 
    'epsh_eq1':'eps est. high next qtr', 
    'epsl_eq1':'eps est. low next qtr', 
    'epssd_ey1':'eps est. std next yr', 
    'epsh_ey1':'eps est. high next yr', 
    'epsl_ey1':'eps est. low next yr',
    'eps_lr':'eps last qtr', 
    'qs_eps':'eps est. last qtr', 
    'qs_sd':'eps est. std last qtr', 
    'eps_rq2':'eps 2 qtr ago', 
    'sq2_eps':'eps est. 2 qtr ago', 
    'sq2_sd':'eps est. std 2 qtr ago',
    'repdt_q0':'Earnings Date'
    },
    5: {},
    6: {
	"price" : 'adj. close',
	"sma20" : 'SMA 20d',
	"sma50" : 'SMA 50d',
	"sma100" : 'SMA 100d',
	"sma200" : 'SMA 200d',
	"sd20" : 'std dev 20d',
	"sd50" : 'std dev 50d',
	"sd100" : 'std dev 100d',
	"sd200" : 'std dev 200d',
	"macd" : 'MACD',
	"macdsg" : 'MACD Signal',
	"ppo" : '% price osc',
	"pposg" : '% price osc signal',
	"rsi" : 'RSI',
	"mf" : 'money flow 20d',
	"adl" : 'AD Line',
	"atr" : 'Avg. True Range',
	"vol10" : 'Volatility 10d',
	"vol20" : 'Volatility 20d',
	"vol126" : 'Volatility 6m',
	"volDS10" : 'DS Volatility 10d',
	"volDS20" : 'DS Volatility 20d',
	"volDS126" : 'DS Volatility 6m',
	"obv" : 'on balance vol',
	"pvo" : '% volume osc',
	"pvosg" : '% volume signal',
	"bollup" : 'bollinger upper',
	"bolllow" : 'bollinger low',
	"bollperc" : '% bollinger',
	"aroonu" : 'aroon up',
	"aroond" : 'aroon down',
	"emv" : 'ease of movement',
	"forcex" : 'force index',
	"massx" : 'mass index',
	"sosfast" : 'stochastic fast',
	"sosslow" : 'stochastic slow',
	"srsi" : 'stochastic RSI',
	"tsi" :'TSI',
	"ulcer" : 'ulcer',
	"daysu" : 'consec. days up',
	"daysd" : 'consec. days down',
	"prchg1d" : 'price chng 1d',
	"prchg1wk" : 'price chng 1w',
	"prchg4wk" : 'price chng 1m',
	"prchg13wk" : 'price chng 3m',
	"prchg26wk" : 'price chng 6m',
	"prchg52wk" : 'price chng 1yr',
	"prh52wk" : 'price high 52wk',
	"prl52wk" : 'price low 52wk' 
	},
    7: { 
    'UNRATE':'Unemployment Rate', 
    'PAYEMS':'Total Nonfarm Employees', 
    'CIVPART':'Labor Force Part. Rate', 
    'WGS3MO':'3mo Treas', 
    'WGS1YR':'1yr Treas', 
    'WGS2YR':'2yr Treas', 
    'WGS5YR':'5yr Treas', 
    'WFII5':'5yr Treas Inf. Adj', 
    'WGS10YR':'10yr Treas', 
    'WFII10':'10yr Treas Inf. Adj', 
    'WGS30YR':'30yr Treas', 
    'WFII30':'30yr Treas Inf. Adj', 
    'MORTGAGE30US':'30yr Mortg', 
    'USD3MTD156N':'LIBOR',
    'ALTSALES':'Auto Sales', 
    "AMTMNO":'Manuf. New Orders', 
    "ANFCI":'Chi Fed Financial Conditions', 
    "BAMLC0A1CAAAEY":'Merrill Corp AAA', 
    "BAMLC0A4CBBBEY":'Merrill Corp BBB', 
    "BAMLH0A0HYM2EY":'Merrill High Yield', 
    "BAMLH0A3HYCEY":'Merrill Corp CCC', 
    'CBI':'Change Priv Inventories', 
    "CPIAUCSL":'CPI', 
    "DCOILBRENTEU":'Brent Crude', 
    "DCOILWTICO":'WTI Crude', 
    "GDP":'GDP', 
    "NAPM":'ISM PMI', 
    "NAPMEI":'ISM Empl.', 
    "NAPMEXI":'ISM New Export Orders', 
    "NAPMII":'ISM Inventories', 
    'NAPMNOI':'ISM New Orders', 
    'NMFBAI':'ISM Businesss Act', 
    'NMFCI':'ISM NMI', 
    'PPIACO':'PPI', 
    'RSAFS':'Retail Sales', 
    'RRSFS':'Real Retail Sales', 
    'RSXFS':'Retail Sales ex. Food', 
    'SPCS20RSA':'Case-Schiller 20', 
    'STLFSI':'STL Financial Stress', 
    'TWEXM':'US Dollar Index', 
    'UMCSENT':'Consumer Sentiment', 
    'UMTMTI':'Manuf. Inventories', 
    'USREC':'Recession', 
    'USSLIND':'US Leading Index', 
    'WAAA':'Moodys Corp AAA', 
    'WBAA':'Moodys Corp BAA', 
    'GASPRICE':'Natural Gas'
    },
    8: { 
    'shrt_intr':'short interest', 
    'days_cv':'days to cover', 
    'vol':'volume' },
    9: { 
    'sales':'sales growth', 
    'netinc':'net income growth', 
    'cgs':'cost of goods growth', 
    'gross':'gross income growth', 
    'rd':'R&D growth', 
    'totexp':'total expenses growth', 
    'dep':'depreciation growth', 
    'int':'interest expense growth', 
    'othinc':'other income growth', 
    'uninc':'unusual income growth', 
    'gopinc':'operating income growth', 
    'intno':'interest expense non-op growth', 
    'pti':'pre-tax income growth',
    'nit':'income after taxes growth', 
    'xord':'nonrecurring items growth', 
    'iac':'net income ex-items growth', 
    'epscon':'EPS cont. growth', 
    'eps':'EPS growth', 
    'epsd':'EPS diluted growth', 
    'epsdc':'EPS diluted cont. growth', 
    'dps':'dividends per share growth' 
    },
    10: {},
    11: {
    'fscore':'F Score',
    'mscore':'M Score',
    'zscore':'Altman Z Score',
    }
}
//create reverse mapping
export const RFIELD_MAP = {};

for(var type in FIELD_MAP) {
    RFIELD_MAP[type] = {};
    
    for(var key in FIELD_MAP[type]) {
        RFIELD_MAP[type][FIELD_MAP[type][key]] = key;
    }
}

export const DICTIONARY_MAP = {
    1: { 
    'sales':'r/revenue.asp', 
    'netinc':'n/netincome.asp', 
    'cgs':'c/cogs.asp', 
    'gross':'g/grossincome.asp', 
    'rd':'r/research-and-development-expenses.asp', 
    'totexp':'o/operating_expense.asp', 
    'dep':'d/depreciation.asp', 
    'int':'i/interestexpense.asp', 
    'othinc':'n/non-operating-income.asp', 
    'uninc':'u/unusual-item.asp', 
    'gopinc':'o/operatingincome.asp', 
    'intno':'n/non-operating-expense.asp', 
    'pti':'p/pretax-earnings.asp', 
    'inctax':'i/incometax.asp',
    'nit':'a/aftertaxincome.asp', 
    'xord':'n/nonrecurring-gain-or-loss.asp', 
    'iac':'n/netincome.asp', 
    'epscon':'c/continuingoperations.asp', 
    'eps':'e/eps.asp', 
    'epsd':'d/dilutedeps.asp', 
    'epsdc':'c/continuingoperations.asp', 
    'dps':'d/dividend.asp' 
    },
    2: { 
    'equity':'s/shareholdersequity.asp', 
    'ar':'r/receivables.asp', 
    'inv':'i/inventory.asp', 
    'oca':'o/othercurrentassets.asp', 
    'ca':'c/currentassets.asp', 
    'nppe':'p/ppe.asp', 
    'gwi':'i/intangibleasset.asp', 
    'olta':'l/longtermassets.asp', 
    'assets':'a/asset.asp', 
    'ap':'a/accountspayable.asp', 
    'stdebt':'s/shorttermdebt.asp', 
    'ocl':'o/othercurrentliabilities.asp', 
    'cl':'c/currentliabilities.asp', 
    'ltdebt':'l/longtermdebt.asp',
    'oltl':'o/otherlongtermliabilities.asp', 
    'liab':'t/total-liabilities.asp', 
    'pref':'p/preferredstock.asp', 
    'totloe':'articles/04/031004.asp', 
    'shr':'o/outstandingshares.asp', 
    'cash':'c/cash.asp' },
    3: { 
    'dep_cf':'d/depreciation.asp', 
    'tco':'c/cash-flow-from-operating-activities.asp', 
    'ce':'c/capitalexpenditure.asp', 
    'tci':'c/cashflowfinvestingactivities.asp', 
    'dps':'d/dividend-per-share.asp', 
    'tcf':'c/cashflowfromfinancing.asp', 
    'ere':'f/foreigncurrencyeffects.asp', 
    'ncc':'n/net-cash.asp' 
    },
    4: { 
    'price':'m/market-price.asp', 
    'mktcap':'m/marketcapitalization.asp', 
    'shr_ay1':'o/outstandingshares.asp', 
    'avd_10d':'a/averagedailytradingvolume.asp', 
    'shrinst':'i/institutionalshares.asp', 
    'instps':'q/qib.asp', 
    'instss':'n/net-institutional-sales.asp', 
    'shrinsd':'i/insider.asp',
    'insdps':'i/insidertrading.asp', 
    'insdss':'i/insidertrading.asp', 
    'priceh_52w':'1/52weekhighlow.asp', 
    'pricel_52w':'1/52weekhighlow.asp', 
    'prchg_04w':'p/price-change.asp', 
    'prchg_13w':'p/price-change.asp',
    'prchg_26w':'p/price-change.asp', 
    'prchg_52w':'p/price-change.asp', 
    'eps_eq0':'e/earningsestimate.asp', 
    'epspm_eq0':'e/earningsestimate.asp', 
    'epsn_eq0':'e/earningsestimate.asp', 
    'eps_ey0':'e/earningsestimate.asp', 
    'epspm_ey0':'e/earningsestimate.asp', 
    'epsn_ey0':'e/earningsestimate.asp', 
    'eps_eq1':'e/earningsestimate.asp', 
    'epspm_eq1':'e/earningsestimate.asp', 
    'epsn_eq1':'e/earningsestimate.asp',
    'eps_ey1':'e/earningsestimate.asp', 
    'epspm_ey1':'e/earningsestimate.asp', 
    'epsn_ey1':'e/earningsestimate.asp', 
    'epsum_eq0':'e/earningsestimate.asp', 
    'epsum_eq1':'e/earningsestimate.asp',
    'epsdm_eq0':'e/earningsestimate.asp', 
    'epsdm_eq1':'e/earningsestimate.asp', 
    'epsum_ey0':'e/earningsestimate.asp', 
    'epsum_ey1':'e/earningsestimate.asp', 
    'epsdm_ey0':'e/earningsestimate.asp', 
    'epsdm_ey1':'e/earningsestimate.asp',
    'eps3m_eq0':'e/earningsestimate.asp', 
    'eps3m_eq1':'e/earningsestimate.asp', 
    'eps3m_ey0':'e/earningsestimate.asp', 
    'eps3m_ey1':'e/earningsestimate.asp',
    'epssd_eq0':'e/earningsestimate.asp', 
    'epsh_eq0':'e/earningsestimate.asp', 
    'epsl_eq0':'e/earningsestimate.asp', 
    'epssd_ey0':'e/earningsestimate.asp', 
    'epsh_ey0':'e/earningsestimate.asp', 
    'epsl_ey0':'e/earningsestimate.asp',
    'epssd_eq1':'e/earningsestimate.asp', 
    'epsh_eq1':'e/earningsestimate.asp', 
    'epsl_eq1':'e/earningsestimate.asp', 
    'epssd_ey1':'e/earningsestimate.asp', 
    'epsh_ey1':'e/earningsestimate.asp', 
    'epsl_ey1':'e/earningsestimate.asp',
    'eps_lr':'e/earningsestimate.asp', 
    'qs_eps':'e/earningsestimate.asp', 
    'qs_sd':'e/earningsestimate.asp', 
    'eps_rq2':'e/earningsestimate.asp', 
    'sq2_eps':'e/earningsestimate.asp', 
    'sq2_sd':'e/earningsestimate.asp',
    'repdt_q0':'e/earnings-announcement.asp'
    },
    5: {},
    6: {
	"price" : 'http://www.investopedia.com/terms/a/adjusted_closing_price.asp',
	"sma20" : 'moving_averages',
	"sma50" : 'moving_averages',
	"sma100" : 'moving_averages',
	"sma200" : 'moving_averages',
	"sd20" : 'standard_deviation_volatility',
	"sd50" : 'standard_deviation_volatility',
	"sd100" : 'standard_deviation_volatility',
	"sd200" : 'standard_deviation_volatility',
	"macd" : 'macd-histogram',
	"macdsg" : 'macd-histogram',
	"ppo" : 'price_oscillators_ppo',
	"pposg" : 'price_oscillators_ppo',
	"rsi" : 'relative_strength_index_rsi',
	"mf" : 'chaikin_money_flow_cmf',
	"adl" : 'accumulation_distribution_line',
	"atr" : 'average_true_range_atr',
	"vol10" : 'standard_deviation_volatility',
	"vol20" : 'standard_deviation_volatility',
	"vol126" : 'standard_deviation_volatility',
	"volDS10" : 'standard_deviation_volatility',
	"volDS20" : 'standard_deviation_volatility',
	"volDS126" : 'standard_deviation_volatility',
	"obv" : 'on_balance_volume_obv',
	"pvo" : 'percentage_volume_oscillator_pvo',
	"pvosg" : 'percentage_volume_oscillator_pvo',
	"bollup" : 'bollinger_bands',
	"bolllow" : 'bollinger_bands',
	"bollperc" : 'bollinger_band_perce',
	"aroonu" : 'aroon',
	"aroond" : 'aroon',
	"emv" : 'ease_of_movement_emv',
	"forcex" : 'force_index',
	"massx" : 'mass_index',
	"sosfast" : 'stochastic_oscillator_fast_slow_and_full',
	"sosslow" : 'stochastic_oscillator_fast_slow_and_full',
	"srsi" : 'stochrsi',
	"tsi" :'true_strength_index',
	"ulcer" : 'ulcer_index',
	"daysu" : '',
	"daysd" : '',
	"prchg1d" : 'rate_of_change_roc_and_momentum',
	"prchg1wk" : 'rate_of_change_roc_and_momentum',
	"prchg4wk" : 'rate_of_change_roc_and_momentum',
	"prchg13wk" : 'rate_of_change_roc_and_momentum',
	"prchg26wk" : 'rate_of_change_roc_and_momentum',
	"prchg52wk" : 'rate_of_change_roc_and_momentum',
	"prh52wk" : 'rate_of_change_roc_and_momentum',
	"prl52wk" : 'rate_of_change_roc_and_momentum' 
	},
    7: { 
    'UNRATE':'u/unemploymentrate.asp', 
    'PAYEMS':'n/nonfarmpayroll.asp', 
    'CIVPART':'p/participationrate.asp', 
    'WGS3MO':'t/treasurybill.asp', 
    'WGS1YR':'t/treasurybill.asp', 
    'WGS2YR':'t/treasurybill.asp', 
    'WGS5YR':'t/treasurybill.asp', 
    'WFII5':'t/tips.asp', 
    'WGS10YR':'1/10-yeartreasury.asp', 
    'WFII10':'t/tips.asp', 
    'WGS30YR':'1/30-yeartreasury.asp', 
    'WFII30':'t/tips.asp', 
    'MORTGAGE30US':'f/fixed-rate_mortgage.asp', 
    'USD3MTD156N':'/l/libor.asp',
    'ALTSALES':'a/autosales.asp', 
    "AMTMNO":'f/factory-orders.asp', 
    "ANFCI":'f/federal-reserve-bank-of-chicago.asp', 
    "BAMLC0A1CAAAEY":'a/aaa.asp', 
    "BAMLC0A4CBBBEY":'i/investmentgrade.asp', 
    "BAMLH0A0HYM2EY":'h/high_yield_bond.asp', 
    "BAMLH0A3HYCEY":'i/investmentgrade.asp', 
    'CBI':'http://research.stlouisfed.org/fred2/series/CBI', 
    "CPIAUCSL":'c/consumerpriceindex.asp', 
    "DCOILBRENTEU":'b/brentblend.asp', 
    "DCOILWTICO":'w/wti.asp', 
    "GDP":'g/gdp.asp', 
    "NAPM":'p/pmi.asp', 
    "NAPMEI":'http://www.ism.ws/pubs/content.cfm?ItemNumber=10706', 
    "NAPMEXI":'http://www.ism.ws/pubs/content.cfm?ItemNumber=10706', 
    "NAPMII":'http://www.ism.ws/pubs/content.cfm?ItemNumber=10706', 
    'NAPMNOI':'http://www.ism.ws/pubs/content.cfm?ItemNumber=10706', 
    'NMFBAI':'http://www.ism.ws/pubs/content.cfm?ItemNumber=10706', 
    'NMFCI':'http://www.ism.ws/pubs/content.cfm?ItemNumber=10706', 
    'PPIACO':'p/ppi.asp', 
    'RSAFS':'r/retail-sales.asp', 
    'RRSFS':'http://research.stlouisfed.org/fred2/series/RRSFS/', 
    'RSXFS':'http://research.stlouisfed.org/fred2/series/RSXFS', 
    'SPCS20RSA':'s/sandp_case_shiller_index.asp', 
    'STLFSI':'http://research.stlouisfed.org/fred2/series/STLFSI', 
    'TWEXM':'u/usdx.asp', 
    'UMCSENT':'c/consumer-sentiment.asp', 
    'UMTMTI':'https://www.census.gov/mtis/definitions.html', 
    'USREC':'r/recession.asp', 
    'USSLIND':'http://research.stlouisfed.org/fred2/series/USSLIND', 
    'WAAA':'m/moodys.asp', 
    'WBAA':'m/moodys.asp', 
    'GASPRICE':'articles/economics/08/gas-prices.asp'
    },
    8: { 
    'shrt_intr':'s/shortinterest.asp', 
    'days_cv':'d/daystocover.asp', 
    'vol':'v/volume.asp' },
    9: {},
    10: {},
    11: {
    'fscore':'p/piotroski-score.asp',
    'mscore':'b/beneishmodel.asp',
    'zscore':'a/altman.asp',
    }
}
