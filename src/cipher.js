// https://stackoverflow.com/a/54026460/12392329

export function cipher(salt) {
	const textToChars = text => text.split('').map(c => c.charCodeAt(0))
	const byteHex = n => ("0" + Number(n).toString(16)).substr(-2)
	const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code)
	return text => text.split('')
		.map(textToChars)
		.map(applySaltToChar)
		.map(byteHex)
		.join('')
}

export function decipher(salt) {
	const textToChars = text => text.split('').map(c => c.charCodeAt(0))
	const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code)
	return encoded => {
		if (encoded === undefined) {
			console.log('encoded undefined!')
			return
		}
		return encoded.match(/.{1,2}/g)
			.map(hex => parseInt(hex, 16))
			.map(applySaltToChar)
			.map(charCode => String.fromCharCode(charCode))
			.join('')
	}
}