/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Sep 23, 2014
 */

Class
  .forName({
    name: "abstract class js.util.Calendar extends Object",

    "private static final String[] FIELD_NAMES": ["ERA", "YEAR",
      "MONTH", "WEEK_OF_YEAR", "WEEK_OF_MONTH", "DAY_OF_MONTH",
      "DAY_OF_YEAR", "DAY_OF_WEEK", "DAY_OF_WEEK_IN_MONTH",
      "AM_PM", "HOUR", "HOUR_OF_DAY", "MINUTE", "SECOND",
      "MILLISECOND", "ZONE_OFFSET", "DST_OFFSET"
    ],

    "public final static YEAR": 1,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the month. This is a calendar-specific value. The
     * first month of the year in the Gregorian and Julian calendars is
     * <code>JANUARY</code> which is 0, the last depends on the number
     * of months in a year.
     *
     * @see #JANUARY
     * @see #FEBRUARY
     * @see #MARCH
     * @see #APRIL
     * @see #MAY
     * @see #JUNE
     * @see #JULY
     * @see #AUGUST
     * @see #SEPTEMBER
     * @see #OCTOBER
     * @see #NOVEMBER
     * @see #DECEMBER
     * @see #UNDECIMBER
     */
    "public final static MONTH": 2,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the week number within the current year. The first
     * week of the year, as defined by <code>getFirstDayOfWeek()</code>
     * and <code>getMinimalDaysInFirstWeek()</code>, has value 1.
     * Subclasses define the value of <code>WEEK_OF_YEAR</code> for
     * days before the first week of the year.
     *
     * @see #getFirstDayOfWeek
     * @see #getMinimalDaysInFirstWeek
     */
    "public final static WEEK_OF_YEAR": 3,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the week number within the current month. The first
     * week of the month, as defined by <code>getFirstDayOfWeek()</code>
     * and <code>getMinimalDaysInFirstWeek()</code>, has value 1.
     * Subclasses define the value of <code>WEEK_OF_MONTH</code> for
     * days before the first week of the month.
     *
     * @see #getFirstDayOfWeek
     * @see #getMinimalDaysInFirstWeek
     */
    "public final static WEEK_OF_MONTH": 4,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the day of the month. This is a synonym for
     * <code>DAY_OF_MONTH</code>. The first day of the month has
     * value 1.
     *
     * @see #DAY_OF_MONTH
     */
    "public final static DATE": 5,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the day of the month. This is a synonym for
     * <code>DATE</code>. The first day of the month has value 1.
     *
     * @see #DATE
     */
    "public final static DAY_OF_MONTH": 5,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the day number within the current year. The first day
     * of the year has value 1.
     */
    "public final static DAY_OF_YEAR": 6,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the day of the week. This field takes values
     * <code>SUNDAY</code>, <code>MONDAY</code>,
     * <code>TUESDAY</code>, <code>WEDNESDAY</code>,
     * <code>THURSDAY</code>, <code>FRIDAY</code>, and
     * <code>SATURDAY</code>.
     *
     * @see #SUNDAY
     * @see #MONDAY
     * @see #TUESDAY
     * @see #WEDNESDAY
     * @see #THURSDAY
     * @see #FRIDAY
     * @see #SATURDAY
     */
    "public final static DAY_OF_WEEK": 7,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the ordinal number of the day of the week within the
     * current month. Together with the <code>DAY_OF_WEEK</code>
     * field, this uniquely specifies a day within a month. Unlike
     * <code>WEEK_OF_MONTH</code> and <code>WEEK_OF_YEAR</code>,
     * this field's value does <em>not</em> depend on
     * <code>getFirstDayOfWeek()</code> or
     * <code>getMinimalDaysInFirstWeek()</code>.
     * <code>DAY_OF_MONTH 1</code> through <code>7</code> always
     * correspond to <code>DAY_OF_WEEK_IN_MONTH
     * 1</code>,
     * <code>8</code> through <code>14</code> correspond to
     * <code>DAY_OF_WEEK_IN_MONTH 2</code>, and so on.
     * <code>DAY_OF_WEEK_IN_MONTH 0</code> indicates the week before
     * <code>DAY_OF_WEEK_IN_MONTH 1</code>. Negative values count
     * back from the end of the month, so the last Sunday of a month is
     * specified as
     * <code>DAY_OF_WEEK = SUNDAY, DAY_OF_WEEK_IN_MONTH = -1</code>.
     * Because negative values count backward they will usually be
     * aligned differently within the month than positive values. For
     * example, if a month has 31 days,
     * <code>DAY_OF_WEEK_IN_MONTH -1</code> will overlap
     * <code>DAY_OF_WEEK_IN_MONTH 5</code> and the end of
     * <code>4</code>.
     *
     * @see #DAY_OF_WEEK
     * @see #WEEK_OF_MONTH
     */
    "public final static DAY_OF_WEEK_IN_MONTH": 8,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating whether the <code>HOUR</code> is before or after
     * noon. E.g., at 10:04:15.250 PM the <code>AM_PM</code> is
     * <code>PM</code>.
     *
     * @see #AM
     * @see #PM
     * @see #HOUR
     */
    "public final static AM_PM": 9,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the hour of the morning or afternoon.
     * <code>HOUR</code> is used for the 12-hour clock (0 - 11). Noon
     * and midnight are represented by 0, not by 12. E.g., at
     * 10:04:15.250 PM the <code>HOUR</code> is 10.
     *
     * @see #AM_PM
     * @see #HOUR_OF_DAY
     */
    "public final static HOUR": 10,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the hour of the day. <code>HOUR_OF_DAY</code> is
     * used for the 24-hour clock. E.g., at 10:04:15.250 PM the
     * <code>HOUR_OF_DAY</code> is 22.
     *
     * @see #HOUR
     */
    "public final static HOUR_OF_DAY": 11,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the minute within the hour. E.g., at 10:04:15.250 PM
     * the <code>MINUTE</code> is 4.
     */
    "public final static MINUTE": 12,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the second within the minute. E.g., at 10:04:15.250 PM
     * the <code>SECOND</code> is 15.
     */
    "public final static SECOND": 13,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the millisecond within the second. E.g., at
     * 10:04:15.250 PM the <code>MILLISECOND</code> is 250.
     */
    "public final static MILLISECOND": 14,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the raw offset from GMT in milliseconds.
     * <p>
     * This field reflects the correct GMT offset value of the time zone
     * of this <code>Calendar</code> if the <code>TimeZone</code>
     * implementation subclass supports historical GMT offset changes.
     */
    "public final static ZONE_OFFSET": 15,

    /**
     * Field number for <code>get</code> and <code>set</code>
     * indicating the daylight saving offset in milliseconds.
     * <p>
     * This field reflects the correct daylight saving offset value of
     * the time zone of this <code>Calendar</code> if the
     * <code>TimeZone</code> implementation subclass supports
     * historical Daylight Saving Time schedule changes.
     */
    "public final static DST_OFFSET": 16,

    /**
     * The number of distinct fields recognized by <code>get</code>
     * and <code>set</code>. Field numbers range from
     * <code>0..FIELD_COUNT-1</code>.
     */
    "public final static FIELD_COUNT": 17,

    /**
     * Value of the {@link #DAY_OF_WEEK} field indicating Sunday.
     */
    "public final static SUNDAY": 1,

    /**
     * Value of the {@link #DAY_OF_WEEK} field indicating Monday.
     */
    "public final static MONDAY": 2,

    /**
     * Value of the {@link #DAY_OF_WEEK} field indicating Tuesday.
     */
    "public final static TUESDAY": 3,

    /**
     * Value of the {@link #DAY_OF_WEEK} field indicating Wednesday.
     */
    "public final static WEDNESDAY": 4,

    /**
     * Value of the {@link #DAY_OF_WEEK} field indicating Thursday.
     */
    "public final static THURSDAY": 5,

    /**
     * Value of the {@link #DAY_OF_WEEK} field indicating Friday.
     */
    "public final static FRIDAY": 6,

    /**
     * Value of the {@link #DAY_OF_WEEK} field indicating Saturday.
     */
    "public final static SATURDAY": 7,

    /**
     * Value of the {@link #MONTH} field indicating the first month of
     * the year in the Gregorian and Julian calendars.
     */
    "public final static JANUARY": 0,

    /**
     * Value of the {@link #MONTH} field indicating the second month of
     * the year in the Gregorian and Julian calendars.
     */
    "public final static FEBRUARY": 1,

    /**
     * Value of the {@link #MONTH} field indicating the third month of
     * the year in the Gregorian and Julian calendars.
     */
    "public final static MARCH": 2,

    /**
     * Value of the {@link #MONTH} field indicating the fourth month of
     * the year in the Gregorian and Julian calendars.
     */
    "public final static APRIL": 3,

    /**
     * Value of the {@link #MONTH} field indicating the fifth month of
     * the year in the Gregorian and Julian calendars.
     */
    "public final static MAY": 4,

    /**
     * Value of the {@link #MONTH} field indicating the sixth month of
     * the year in the Gregorian and Julian calendars.
     */
    "public final static JUNE": 5,

    /**
     * Value of the {@link #MONTH} field indicating the seventh month of
     * the year in the Gregorian and Julian calendars.
     */
    "public final static JULY": 6,

    /**
     * Value of the {@link #MONTH} field indicating the eighth month of
     * the year in the Gregorian and Julian calendars.
     */
    "public final static AUGUST": 7,

    /**
     * Value of the {@link #MONTH} field indicating the ninth month of
     * the year in the Gregorian and Julian calendars.
     */
    "public final static SEPTEMBER": 8,

    /**
     * Value of the {@link #MONTH} field indicating the tenth month of
     * the year in the Gregorian and Julian calendars.
     */
    "public final static OCTOBER": 9,

    /**
     * Value of the {@link #MONTH} field indicating the eleventh month
     * of the year in the Gregorian and Julian calendars.
     */
    "public final static NOVEMBER": 10,

    /**
     * Value of the {@link #MONTH} field indicating the twelfth month of
     * the year in the Gregorian and Julian calendars.
     */
    "public final static DECEMBER": 11,

    /**
     * Value of the {@link #MONTH} field indicating the thirteenth month
     * of the year. Although <code>GregorianCalendar</code> does not
     * use this value, lunar calendars do.
     */
    "public final static UNDECIMBER": 12,

    /**
     * Value of the {@link #AM_PM} field indicating the period of the
     * day from midnight to just before noon.
     */
    "public final static AM": 0,

    /**
     * Value of the {@link #AM_PM} field indicating the period of the
     * day from noon to just before midnight.
     */
    "public final static PM": 1,

    /**
     * The calendar field values for the currently set time for this
     * calendar. This is an array of <code>FIELD_COUNT</code>
     * integers, with index values <code>ERA</code> through
     * <code>DST_OFFSET</code>.
     *
     * @serial
     */
    "protected fields": [],

    /**
     * The flags which tell if a specified calendar field for the
     * calendar is set. A new object has no fields set. After the first
     * call to a method which generates the fields, they all remain set
     * after that. This is an array of <code>FIELD_COUNT</code>
     * booleans, with index values <code>ERA</code> through
     * <code>DST_OFFSET</code>.
     *
     * @serial
     */
    "protected isFieldsSet": [],

    /**
     * Pseudo-time-stamps which specify when each field was set. There
     * are two special values, UNSET and COMPUTED. Values from
     * MINIMUM_USER_SET to Integer.MAX_VALUE are legal user set values.
     */
    "transient private int stamp": [],

    "protected time": 0,
    "protected isTimeSet": false,

    "protected areFieldsSet": false,

    /**
     * True if all fields have been set.
     *
     * @serial
     */
    "protected areAllFieldsSet": false,

    Calendar: function() {
      this.fields = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0
      ];
      this.stamp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0
      ];
      this.isFieldsSet = [false, false, false, false, false, false,
        false, false, false, false, false, false, false, false,
        false, false, false
      ];
    },

    /**
     * Adds or subtracts the specified amount of time to the given
     * calendar field, based on the calendar's rules.
     */
    "abstract add": function(field, amount) {},

    /**
     * Returns whether this Calendar represents a time after the time
     * represented by the specified Object.
     */
    "after": function(when) {
      return this.compareTo(when) > 0;
    },

    /**
     * Returns whether this Calendar represents a time before the time
     * represented by the specified Object.
     */
    "before": function(when) {
      return this.compareTo(when) < 0;
    },

    /**
     * Sets all the calendar field values and the time value
     * (millisecond offset from the Epoch) of this Calendar undefined.
     * Sets the given calendar field value and the time value
     * (millisecond offset from the Epoch) of this Calendar undefined.
     */
    "clear": function(field) {
      if (field) {
        this.fields[field] = 0;
        this.isFieldsSet[field] = false;
        this.stamp[field] = 0;
        this.areAllFieldsSet = this.areFieldsSet = false;
        this.isTimeSet = false;
      } else {
        for (var i = 0; i < this.fields.length;) {
          this.fields[i] = 0;
          this.stamp[i] = 0; // UNSET == 0
          this.isFieldsSet[i++] = false;
        }
        this.areAllFieldsSet = this.areFieldsSet = false;
        this.isTimeSet = false;
      }

    },

    /** Creates and returns a copy of this object. */
    "clone": function() {
      var other = this.getClass().newInstance(),
        Calendar = js.util.Calendar,
        names = Calendar.FIELD_NAMES,
        len = names.length;

      for (var i = 0; i < len; i++) {
        other.fields[i] = this.fields[i];
        other.stamp[i] = this.stamp[i];
        other.isFieldsSet[i] = this.isFieldsSet[i];
      }

      other.time = this.time;
      return other;
    },

    /**
     * Compares the time values (millisecond offsets from the Epoch)
     * represented by two Calendar objects.
     */
    "compareTo": function(anotherCalendar) {
      if (!Object.isInstanceof(anotherCalendar, js.util.Calendar)) {
        throw new js.lang.IllegalArgumentException(
          "Parameters of the compareTo method of the js.util.Calendar object to receive only js.util.Calendar type");
      }
      var anotherTime = anotherCalendar.getTimeInMillis();

      return this.time > anotherTime ? 1 : (this.time == anotherTime ? 0 : -1);
    },

    /** Compares this Calendar to the specified Object. */
    "equals": function(obj) {

      if (this == obj)
        return true;

      var that = obj;
      return this.compareTo(that) === 0;
    },

    /** Returns the value of the given calendar field. */
    "get": function(field) {
      this.complete();
      return this.internalGet(field);
    },

    "protected final internalGet": function(field) {
      return this.fields[field];
    },

    /** Gets a calendar with the specified time zone and locale. */
    "static getInstance": function() {
      return new js.util.GregorianCalendar();
    },

    /**
     * Returns a Date object representing this Calendar's time value
     * (millisecond offset from the Epoch").
     */
    "getTime": function() {
      return new Date(this.getTimeInMillis());
    },

    /**
     * Recomputes the time and updates the status fields isTimeSet and
     * areFieldsSet. Callers should check isTimeSet and only call this
     * method if isTimeSet is false.
     */
    "private void updateTime": function() {
      this.computeTime();
      // The areFieldsSet and areAllFieldsSet values are no longer
      // controlled here (as of 1.5).
      this.isTimeSet = true;
    },

    /**
     * Converts the current calendar field values in
     * {@link #fields fields[]} to the millisecond time value
     * {@link #time}.
     *
     * @see #complete()
     * @see #computeFields()
     */
    "protected abstract computeTime": function() {},

    "protected abstract computeFields": function() {},

    "protected void complete": function() {
      if (!this.isTimeSet)
        this.updateTime();
      if (!this.areFieldsSet || !this.areAllFieldsSet) {
        this.computeFields();
        // fills in unset fields
        this.areAllFieldsSet = this.areFieldsSet = true;
      }
    },

    /** Returns this Calendar's time value in milliseconds. */
    "getTimeInMillis": function() {
      if (!this.isTimeSet) {
        this.updateTime();
      }
      return this.time;
    },

    "public set": function(field, value) {
      // If the fields are partially normalized, calculate all the
      // fields before changing any fields.
      if (this.areFieldsSet && !this.areAllFieldsSet) {
        this.computeFields();
      }
      this.internalSet(field, value);
      this.isTimeSet = false;
      this.areFieldsSet = false;
      this.isFieldsSet[field] = true;
      this.areAllFieldsSet = false;
      this.stamp[field] = 2;
    },

    "final internalSet": function(field, value) {
      this.fields[field] = value;
    },

    /**
     * Determines if the given calendar field has a value set, including
     * cases that the value has been set by internal fields calculations
     * triggered by a <code>get</code> method call.
     *
     * @return <code>true</code> if the given calendar field has a
     *         value set; <code>false</code> otherwise.
     */
    "public final isFieldSet": function(field) {
      return this.stamp[field] > 1;
    },

    /**
     * Determines if the given calendar field has a value set, including
     * cases that the value has been set by internal fields calculations
     * triggered by a <code>get</code> method call.
     *
     * @return <code>true</code> if the given calendar field has a
     *         value set; <code>false</code> otherwise.
     */
    "public final boolean isSet": function(field) {
      return this.stamp[field] !== 0;
    },

    /**
     * Sets the values for the calendar fields <code>YEAR</code>,
     * <code>MONTH</code>, and <code>DAY_OF_MONTH</code>. Previous
     * values of other calendar fields are retained. If this is not
     * desired, call {@link #clear()} first.
     *
     * @param year
     *            the value used to set the <code>YEAR</code> calendar
     *            field.
     * @param month
     *            the value used to set the <code>MONTH</code>
     *            calendar field. Month value is 0-based. e.g., 0 for
     *            January.
     * @param date
     *            the value used to set the <code>DAY_OF_MONTH</code>
     *            calendar field.
     * @see #set(int,int)
     * @see #set(int,int,int,int,int)
     * @see #set(int,int,int,int,int,int)
     */
    "setDate": function(year, month, date, hourOfDay, minute, second) {
      var Calendar = js.util.Calendar;
      this.set(Calendar.YEAR, year);
      this.set(Calendar.MONTH, month);
      this.set(Calendar.DATE, date);
      this.set(Calendar.HOUR_OF_DAY, hourOfDay);
      this.set(Calendar.MINUTE, minute);
      this.set(Calendar.SECOND, second);
    },

    /** Sets this Calendar's time with the given Date. */
    "setTime": function(date) {
      if (!Object.isDate(date)) {
        throw new js.lang.IllegalArgumentException(
          "Parameters of the setTime method of the js.util.Calendar object to receive only Date type");
      }
      this.setTimeInMillis(date.getTime());
    },

    /** Sets this Calendar's current time from the given long value. */
    "setTimeInMillis": function(millis) {
      if (this.time == millis && this.isTimeSet && this.areFieldsSet && this.areAllFieldsSet) {
        return;
      }
      this.time = millis;
      this.isTimeSet = true;
      this.areFieldsSet = false;
      this.computeFields();
      this.areAllFieldsSet = this.areFieldsSet = true;
    },

    "final setFieldsComputed": function() {
      for (var i = 0; i < this.fields.length; i++) {
        this.stamp[i] = 1;
        this.isSet[i] = true;
      }
      this.areFieldsSet = this.areAllFieldsSet = true;
    },

    "final setFieldsNormalized": function() {
      for (var i = 0; i < this.fields.length; i++) {
        this.stamp[i] = this.fields[i] = 0; // UNSET == 0
        this.isSet[i] = false;
      }
      // Some or all of the fields are in sync with the
      // milliseconds, but the stamp values are not normalized yet.
      this.areFieldsSet = true;
      this.areAllFieldsSet = false;
    },

    /** Return a string representation of this calendar. */
    "toString": function() {

      var buffer = new js.lang.StringBuffer(),
        Calendar = js.util.Calendar,
        names = Calendar.FIELD_NAMES;
      buffer.append(this.getClass().getFullName()).append('[');
      buffer.append("time=").append(this.time);
      buffer.append(",areFieldsSet=").append(this.areFieldsSet);
      buffer.append(",areAllFieldsSet=").append(this.areAllFieldsSet);

      for (var i = 0, len = names.length; i < len; ++i) {
        buffer.append(',');
        buffer.append(names[i]).append("=").append(this.fields[i]);
      }
      buffer.append(']');
      return buffer.toString();
    }
  });

