function processRelativeTime(number, withoutSuffix, key, isFuture) {
    var format = {
        'm': ['eine Minute', 'einer Minute'],
        'h': ['eine Stunde', 'einer Stunde'],
        'd': ['ein Tag', 'einem Tag'],
        'dd': [number + ' Tage', number + ' Tagen'],
        'M': ['ein Monat', 'einem Monat'],
        'MM': [number + ' Monate', number + ' Monaten'],
        'y': ['ein Jahr', 'einem Jahr'],
        'yy': [number + ' Jahre', number + ' Jahren']
    };
    return withoutSuffix ? format[key][0] : format[key][1];
}

$("#searchDate").datetimepicker(
  {
    format: "DD.MM.YYYY",
    locale: moment.locale("de",
        {
            months : 'Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
            monthsShort : 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
            weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
            weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
            weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
            longDateFormat : {
                LT: 'HH:mm',
                LTS: 'HH:mm:ss',
                L : 'DD.MM.YYYY',
                LL : 'D. MMMM YYYY',
                LLL : 'D. MMMM YYYY HH:mm',
                LLLL : 'dddd, D. MMMM YYYY HH:mm'
            },
            calendar : {
                sameDay: '[heute um] LT [Uhr]',
                sameElse: 'L',
                nextDay: '[morgen um] LT [Uhr]',
                nextWeek: 'dddd [um] LT [Uhr]',
                lastDay: '[gestern um] LT [Uhr]',
                lastWeek: '[letzten] dddd [um] LT [Uhr]'
            },
            relativeTime : {
                future : 'in %s',
                past : 'vor %s',
                s : 'ein paar Sekunden',
                m : processRelativeTime,
                mm : '%d Minuten',
                h : processRelativeTime,
                hh : '%d Stunden',
                d : processRelativeTime,
                dd : processRelativeTime,
                M : processRelativeTime,
                MM : processRelativeTime,
                y : processRelativeTime,
                yy : processRelativeTime
            },
            ordinalParse: /\d{1,2}\./,
            ordinal : '%d.',
            week : {
                dow : 1, // Monday is the first day of the week.
                doy : 4  // The week that contains Jan 4th is the first week of the year.
            }
        }
    ),
    //sideBySide: true,
    tooltips: {
        today: 'Heute anzeigen',
        clear: 'Auswahl löschen',
        close: 'Schliessen',
        selectMonth: 'Monat wählen',
        prevMonth: 'Vorheriger Monat',
        nextMonth: 'Nächster Monat',
        selectYear: 'Jahr wählen',
        prevYear: 'Vorheriges Jahr',
        nextYear: 'Nächstes Jahr',
        selectDecade: 'Dekade wählen',
        prevDecade: 'Vorherige Dekade',
        nextDecade: 'Nächste Dekade',
        prevCentury: 'Vorheriges Jahrhundert',
        nextCentury: 'Nächstes Jahrhundert'
    }
  }
);

$(function() {
  $("#searchForm").submit(function(event) {
    event.preventDefault();
    console.log("searchForm submit!");
    document.location = "http://hungrypeople.snaxter.ch/snaxter/products/"+$("#searchDate").val()+"/"+$("#searchLocation").val();
  });
});
