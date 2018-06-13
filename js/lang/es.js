var app = app || {};

app.lang = app.lang || {};

app.lang['es'] = (function() {

	return {
		'self.label': 'Español',
		'main.message.status.0': 'Error: No hay conexión de red',
		'admin.general-settings.label': 'Configuración general',
		'admin.payment-history.label': 'Historia de Pagos',
		'admin.pin.label': 'Código de administración',
		'admin.pin.description': 'Evita el acceso no autorizado a las áreas administrativas',
		'admin.pin.set-pin.title': 'Establecer el código',
		'admin.pin.change-pin.title': 'Cambiar el código',
		'admin.pin.set': 'Establecer',
		'admin.pin.change': 'Cambiar',
		'admin.pin.remove': 'Retirar',
		'admin.pin.min-length': 'El código debe tener al menos {{minLength}} dígito(s)',
		'settings.display-currency.label': 'Moneda de cambio',
		'settings.date-format.label': 'Formato de fecha',
		'settings.accept-crypto-currencies.label': '¿Qué monedas quiere aceptar?',
		'settings.field-required': '{{label}} es requerido',
		'pay-enter-amount.description': 'Introduzca la cantidad a pagar',
		'pay-enter-amount.continue': 'Continuar',
		'pay-enter-amount.valid-number': 'La cantidad debe ser un número valido',
		'pay-enter-amount.greater-than-zero': 'La cantidad debe ser mayor que cero',
		'pay-choose-method.description': 'Seleccione un método de pago',
		'pay-choose-method.cancel': 'Cancelar',
		'pay-address.description': 'Escanee el código QR',
		'pay-address.cancel': 'Cancelar',
		'pay-address.back': 'Regresar',
		'payment.status.pending': 'Pendiente',
		'payment.status.canceled': 'Cancelado',
		'payment.status.unconfirmed': 'Aceptado',
		'payment.status.confirmed': 'Confirmado',
		'payment.status.timed-out': 'Caducado',
		'payment-history.failed-to-get-payment-data': 'Fallo cargando el pago',
		'payment-history.empty': 'Sin pagos',
		'payment-details.title': 'Detalles de pago',
		'payment-details.label.status': 'Estado',
		'payment-details.label.timestamp': 'Fecha',
		'payment-details.label.amount': 'Cantidad',
		'payment-details.back': 'Regresar',
		'payment-request.data.invalid': '"data" no es válido',
		'payment-request.status.invalid': '"status" no es válido',
		'payment-status.unconfirmed.message': '¡Gracias!',
		'payment-status.unconfirmed.done': 'Hecho',
		'payment-status.timed-out.message': 'Caducado',
		'payment-status.timed-out.done': 'OK',
		'sample-addresses.label': 'Direcciones de muestra:',
		'enter-pin.cancel': 'Cancelar',
		'enter-pin.submit': 'Entregar',
		'pin-required.title': 'Se requiere código administrativo',
		'pin-required.instructions': 'Entregar el código administrativo, si desea continuar',
		'pin-required.incorrect': 'El código era incorrecto',
		'device.camera.not-available': 'Cámara del dispositivo no disponible',
		'more-menu.about': 'Acerca de esta aplicación',
	};

})();
