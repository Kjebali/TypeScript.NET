﻿///<reference path="System.ts"/>

/*
 * @author electricessence / https://github.com/electricessence/
 * Liscensing: MIT https://github.com/electricessence/TypeScript.NET/blob/master/LICENSE
 */

module System
{
	var ticksPerMillisecond = 10000,
		msPerSecond = 1000,
		secondsPerMinute = 60,
		minutesPerHour = 60,
		earthHoursPerDay = 24;

	export enum TimeUnit
	{
		Ticks,
		Milliseconds,
		Seconds,
		Minutes,
		Hours,
		Days
	} // Earth Days

	function assertValidUnit(unit: TimeUnit): boolean
	{
		if (isNaN(unit) || unit > TimeUnit.Days || unit < TimeUnit.Ticks || Math.floor(unit) != unit)
			throw new Error("Invalid TimeUnit.");

		return true;
	}

	export interface IMeasureTime
	{
		ticks: number;
		milliseconds: number;
		seconds: number;
		minutes: number;
		hours: number;
		days: number;
	}

	export class ClockTime implements IMeasureTime
	{
		private _milliseconds: number;

		constructor(milliseconds: number);
		constructor(hours: number, minutes: number, seconds?: number, milliseconds?: number);
		constructor(...args: number[])
		{
			this._milliseconds =
			args.length > 1
			? TimeSpan.millisecondsFromTime(
				args[0] || 0,
				args[1] || 0,
				args.length > 2 && args[2] || 0,
				args.length > 3 && args[3] || 0)
			: (args.length > 0 && args[0] || 0);
		}

		private _ticks: number;
		get ticks(): number
		{
			var _ = this, r = _._ticks;
			if (r === undefined)
				_._ticks = r = (_._milliseconds - Math.floor(_._milliseconds)) * ticksPerMillisecond;
			return r;
		}

		private _ms: number;
		get milliseconds(): number
		{
			var _ = this, r = _._ms;
			if (r === undefined)
				_._ms = r =
				(this._milliseconds | 0) % msPerSecond;
			return r;
		}

		private _seconds: number;
		get seconds(): number
		{
			var _ = this, r = _._seconds;
			if (r === undefined)
				_._seconds = r =
				((this._milliseconds / msPerSecond) | 0) % secondsPerMinute;
			return r;
		}

		private _minutes: number;
		get minutes(): number
		{
			var _ = this, r = _._minutes;
			if (r === undefined)
				_._minutes = r =
				((this._milliseconds
					/ msPerSecond
					/ secondsPerMinute) | 0) % minutesPerHour;

			return r;
		}

		private _hours: number;
		get hours(): number
		{
			var _ = this, r = _._hours;
			if (r === undefined)
				_._hours = r =
				((this._milliseconds
					/ msPerSecond
					/ secondsPerMinute
					/ minutesPerHour) | 0) % earthHoursPerDay;
			return r;

		}

		private _days: number;
		get days(): number
		{
			var _ = this, r = _._days;
			if (r === undefined)
				_._days = r =
				(this._milliseconds
					/ msPerSecond
					/ secondsPerMinute
					/ minutesPerHour
					/ earthHoursPerDay) | 0;
			return r;
		}
		toTimeSpan(): TimeSpan
		{
			return new TimeSpan(this._milliseconds);
		}

		// Static version for relative consistency.  Constructor does allow this format.
		static from(hours: number, minutes: number, seconds: number= 0, milliseconds: number= 0): ClockTime
		{
			return new ClockTime(hours, minutes, seconds, milliseconds);
		}

	}
	
	// This class allows for passing around a specific measure of time coerced by its unit type.
	export class TimeUnitValue
	{

		constructor(public value: number, private _type: TimeUnit)
		{
			assertValidUnit(_type);
		}

		// To avoid confusion, the unit type can only be set once at construction.
		get type(): TimeUnit
		{
			return this._type;
		}

		toTimeSpan(): TimeSpan
		{
			return new TimeSpan(this.value, this.type);
		}

		to(units: TimeUnit = this.type): TimeUnitValue
		{
			return this.toTimeSpan().toTimeUnitValue(units);
		}

	}

	export class TimeSpan implements IMeasureTime
	{

		private _milliseconds: number;

		// In .NET the default type is Ticks, but for JavaScript, we will use Milliseconds.
		constructor(value: number, units: TimeUnit = TimeUnit.Milliseconds)
		{
			this._milliseconds = TimeSpan.convertToMilliseconds(value, units);
		}

		equals(other: TimeSpan): boolean
		{
			return System.areEqual(this._milliseconds, other.milliseconds, false);
		}

		toTimeUnitValue(units: TimeUnit = TimeUnit.Milliseconds): TimeUnitValue
		{
			return new TimeUnitValue(this.total(units), units);
		}

		static convertToMilliseconds(value: number, units: TimeUnit = TimeUnit.Milliseconds): number
		{
			//noinspection FallThroughInSwitchStatementJS
			switch (units)
			{
				case TimeUnit.Days:
					value *= earthHoursPerDay;
				case TimeUnit.Hours:
					value *= minutesPerHour;
				case TimeUnit.Minutes:
					value *= secondsPerMinute;
				case TimeUnit.Seconds:
					value *= msPerSecond;
				case TimeUnit.Milliseconds:
					return value;
				case TimeUnit.Ticks:
					return value / ticksPerMillisecond;
				default:
					throw new Error("Invalid TimeUnit.");
			}
		}

		total(units: TimeUnit): number
		{
			var _ = this;
			switch (units)
			{
				case TimeUnit.Days:
					return _.days;
				case TimeUnit.Hours:
					return _.hours;
				case TimeUnit.Minutes:
					return _.minutes;
				case TimeUnit.Seconds:
					return _.seconds;
				case TimeUnit.Milliseconds:
					return _._milliseconds;
				case TimeUnit.Ticks:
					return _._milliseconds * ticksPerMillisecond;
				default:
					throw new Error("Invalid TimeUnit.");
			}
		}

		get ticks(): number
		{
			return this._milliseconds * ticksPerMillisecond;
		}

		get milliseconds(): number
		{
			return this._milliseconds;
		}

		get seconds(): number
		{
			return this._milliseconds / msPerSecond;
		}

		get minutes(): number
		{
			return this.seconds / secondsPerMinute;
		}

		get hours(): number
		{
			return this.minutes / minutesPerHour;
		}

		get days(): number
		{
			return this.hours / earthHoursPerDay;
		}

		// Instead of the confusing total versus unit name, expose a 'ClockTime' value which reports the individual components.
		get time(): ClockTime
		{
			return new ClockTime(this._milliseconds);
		}

		add(other: ClockTime): TimeSpan;
		add(other: TimeUnitValue): TimeSpan;
		add(other: TimeSpan): TimeSpan;
		add(other: any): TimeSpan
		{
			if (System.Types.isNumber(other))
				throw new Error("Use .addUnit to add a numerical value amount.  .add only supports ClockTime, TimeSpan, and TimeUnitValue.");
			if (other instanceof TimeUnitValue || other instanceof ClockTime)
				other = other.toTimeSpan();
			return new TimeSpan(this._milliseconds + other.milliseconds);
		}

		addUnit(value: number, units: TimeUnit = TimeUnit.Milliseconds): TimeSpan
		{
			return new TimeSpan(this._milliseconds + TimeSpan.convertToMilliseconds(value, units));
		}


		static from(value: number, units: TimeUnit)
		{
			return new TimeSpan(value, units);
		}

		static fromDays(value: number): TimeSpan
		{
			return new TimeSpan(value, TimeUnit.Days);
		}

		static fromHours(value: number): TimeSpan
		{
			return new TimeSpan(value, TimeUnit.Hours);
		}

		static fromMinutes(value: number): TimeSpan
		{
			return new TimeSpan(value, TimeUnit.Minutes);
		}

		static fromSeconds(value: number): TimeSpan
		{
			return new TimeSpan(value, TimeUnit.Seconds);
		}

		static fromMilliseconds(value: number): TimeSpan
		{
			return new TimeSpan(value, TimeUnit.Milliseconds);
		}

		static fromTicks(value: number): TimeSpan
		{
			return new TimeSpan(value, TimeUnit.Ticks);
		}

		static fromTime(hours: number, minutes: number, seconds: number= 0, milliseconds: number= 0): TimeSpan
		{
			return new TimeSpan(TimeSpan.millisecondsFromTime(hours, minutes, seconds, milliseconds));
		}

		static millisecondsFromTime(hours: number, minutes: number, seconds: number= 0, milliseconds: number= 0): number
		{
			var value = hours;
			value *= minutesPerHour;
			value += minutes;
			value *= secondsPerMinute;
			value += seconds;
			value *= msPerSecond;
			value += milliseconds;
			return value;
		}

		static between(first: Date, last: Date): TimeSpan
		{
			return new TimeSpan(last.getTime() - first.getTime());
		}


		static get zero(): TimeSpan
		{
			return timeSpanZero;
		}
	}

	var timeSpanZero = new TimeSpan(0);
}