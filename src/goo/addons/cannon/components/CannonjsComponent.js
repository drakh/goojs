define([
	'goo/entities/components/Component'
],
/** @lends */
function(
	Component
) {
	"use strict";

	function CannonjsComponent(settings) {
		Component.call( this );
		this.type = 'CannonjsComponent';

		this.settings = settings || {};

		this.mass = settings.mass !== undefined ? settings.mass : 0;
		this.useBounds = settings.useBounds !== undefined ? settings.useBounds : false;

		this.linearDamping = settings.linearDamping !== undefined ? settings.linearDamping : 0;
		this.angularDamping = settings.angularDamping !== undefined ? settings.angularDamping : 0;

		this.api = {
			'cannonjsComponent': this
		}
	}

	CannonjsComponent.prototype = Object.create(Component.prototype);

	return CannonjsComponent;
});