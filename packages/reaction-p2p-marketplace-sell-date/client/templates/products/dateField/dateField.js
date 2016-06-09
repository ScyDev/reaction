

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

var dtpLocaleDe = moment.locale("de",
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
);
var dtpTooltipsDe = {
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
};

function setLatestOrderMaxDate() {
  // set maxDate on latestOrderDate Datetimepicker
  let maxDate = moment($('.forSaleOnDate-edit-input').val(), "DD.MM.YYYY").startOf('day');
  maxDate = moment(maxDate.format("DD.MM.YYYY")+" "+$(".pickupTimeFrom-edit-input").val(), "DD.MM.YYYY HH:mm");
  maxDate = maxDate.subtract(1, "hour");
  console.log("setting max Date: "+maxDate.toString());
  $('.datetimepicker-latestOrderDate').data("DateTimePicker").maxDate(maxDate);
}

function initDatepickers() {

	// set date from real input field
	let dateTimePickerDefaultDate_forSaleOnDate = $('.forSaleOnDate-edit-input').val();
	//console.log("read dateTimePickerDefaultDate_forSaleOnDate: ",dateTimePickerDefaultDate_forSaleOnDate);
	if (dateTimePickerDefaultDate_forSaleOnDate == null || dateTimePickerDefaultDate_forSaleOnDate == "") {
		//dateTimePickerDefaultDate_forSaleOnDate = moment().add(1, 'days').hour(8)
	}
	else {
		dateTimePickerDefaultDate_forSaleOnDate = moment(dateTimePickerDefaultDate_forSaleOnDate, "DD.MM.YYYY HH:mm")
	}
	//console.log("new dateTimePickerDefaultDate_forSaleOnDate: ",dateTimePickerDefaultDate_forSaleOnDate);

  $('.datetimepicker-forSaleOnDate').datetimepicker({
    format: "dddd DD.MM.YYYY", //
    locale: dtpLocaleDe,
		showClose: true,
    tooltips: dtpTooltipsDe,
		keepInvalid: true,
		useCurrent: false,
		defaultDate: dateTimePickerDefaultDate_forSaleOnDate
  });

  $('.datetimepicker-forSaleOnDate').off();
  $('.datetimepicker-forSaleOnDate').on("dp.change", function(event) {
    console.log("datetimepicker-forSaleOnDate changed: ",event.date);

    const fixedDatetime = event.date;
    $('.forSaleOnDate-edit-input').val(fixedDatetime.format("DD.MM.YYYY"));
		Alerts.removeSeen();
    $('.forSaleOnDate-edit-input').trigger("change");

    setLatestOrderMaxDate();

    // automatically set latest order date to same day
    $('.latestOrderDate-dummy-input').val(moment(fixedDatetime).add(9.5, "hours").format("DD.MM.YYYY HH:mm"));
    $('.latestOrderDate-edit-input').val(moment(fixedDatetime).add(9.5, "hours").format("DD.MM.YYYY HH:mm"));
    $('.latestOrderDate-edit-input').trigger("change");
  });

	// ######################################################################

	// set date from real input field
  let dateTimePickerDefaultDate_latestOrderDate = $('.latestOrderDate-edit-input').val();
	// console.log("read dateTimePickerDefaultDate_latestOrderDate: ",dateTimePickerDefaultDate_latestOrderDate);
	if (dateTimePickerDefaultDate_latestOrderDate == null || dateTimePickerDefaultDate_latestOrderDate == "") {
		//dateTimePickerDefaultDate_latestOrderDate = moment().add(1, 'days').hour(8)
	}
	else {
		dateTimePickerDefaultDate_latestOrderDate = moment(dateTimePickerDefaultDate_latestOrderDate, "DD.MM.YYYY HH:mm")
	}
	// console.log("new dateTimePickerDefaultDate_latestOrderDate: ",dateTimePickerDefaultDate_latestOrderDate);

  $('.datetimepicker-latestOrderDate').datetimepicker({
    format: "dddd DD.MM.YYYY HH:mm", //
    locale: dtpLocaleDe,
    sideBySide: true,
		showClose: true,
    tooltips: dtpTooltipsDe,
		keepInvalid: true,
		useCurrent: false,
    //maxDate: moment($('.forSaleOnDate-edit-input')).add(9.5, "hours"),
		defaultDate: dateTimePickerDefaultDate_latestOrderDate
  });

  $('.datetimepicker-latestOrderDate').off();
  $('.datetimepicker-latestOrderDate').on("dp.change", function(event) {
    // console.log("datetimepicker changed: ",event.date);

    let fixedDatetime = event.date;
    $('.latestOrderDate-edit-input').val(fixedDatetime.format("DD.MM.YYYY HH:mm"));
		Alerts.removeSeen();
    $('.latestOrderDate-edit-input').trigger("change");
  });

	// also save manual changes to date and time
	$('.latestOrderDate-dummy-input').off("keyup");
	$('.latestOrderDate-dummy-input').on("keyup", function(event) {
    // console.log("latestOrderDate-dummy-input changed: ",event);

		$('.latestOrderDate-edit-input').val(event.target.value);
    $('.latestOrderDate-edit-input').trigger("change");
  });

  setLatestOrderMaxDate();

	const initTimePicker = (name) => {
		const pickerChangeHandler = ( event, input ) => {
			input.val(event.target.value);
			Alerts.removeSeen();
	    input.trigger("change");

      setLatestOrderMaxDate();
		}
		const dummyInput = $( `.${name}-dummy-input` );
		const realInput = $( `.${name}-edit-input` );
		dummyInput.datetimepicker({ format: "HH:mm" });
		dummyInput.val(realInput.val());
	  dummyInput.on("dp.change", event => pickerChangeHandler(event, realInput) );
		// also save manual changes to date and time
		dummyInput.off("keyup");
		dummyInput.on("keyup", event => pickerChangeHandler(event, realInput) );
	}

	initTimePicker("pickupTimeFrom");
	initTimePicker("pickupTimeTo");

  console.log("activated datepicker");
}

Template.productDetailDateField.inheritsHelpersFrom(["productDetail", "productDetailEdit"]);
Template.productDetailDateField.inheritsEventsFrom(["productDetail", "productDetailEdit"]);
Template.productDetailDateField.inheritsHooksFrom(["productDetail", "productDetailEdit"]);

Template.productDetailDateField.onCreated(
  function() {
    Template.instance().autorun(function() {
      //initDatepickers();
    });
  }
);

Template.productDetailDateField.onRendered(
  function() {
    Meteor.setTimeout(function() { // what the?!? document doesn't seem to be ready immediately when this event is fired...
      initDatepickers();
    }, 100);

    Meteor.setTimeout(function() { // what the?!? document doesn't seem to be ready immediately when this event is fired...
      initDatepickers();
    }, 1000);

    Meteor.setTimeout(function() { // what the?!? document doesn't seem to be ready immediately when this event is fired...
      initDatepickers();
    }, 2000);

  }
);

Template.registerHelpers(
  {
    prettifyDate: function(inDate) {
			return moment(inDate).locale("de").format('dddd DD.MM.YYYY');
    },
    prettifyDateTime: function(inDate) {
      return moment(inDate).locale("de").format('dddd DD.MM.YYYY HH:mm');
    }
  }
);
