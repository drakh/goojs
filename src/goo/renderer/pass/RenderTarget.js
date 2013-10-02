define(['goo/math/Vector2'],
	/** @lends */
	function (Vector2) {
	"use strict";

	/**
	 * Creates a new RenderTarget object
	 *
	 * @class Post processing handler
	 * @param {Number} width Width of rendertarget
	 * @param {Number} height Height of rendertarget
	 * @param {Parameters} parameters Settings
	 */
	function RenderTarget(width, height, options) {
		this.glTexture = null;
		this._glRenderBuffer = null;
		this._glFrameBuffer = null;

		this.width = Math.floor(width);
		this.height = Math.floor(height);

		options = options || {};

		this.wrapS = options.wrapS !== undefined ? options.wrapS : 'EdgeClamp';
		this.wrapT = options.wrapT !== undefined ? options.wrapT : 'EdgeClamp';

		this.magFilter = options.magFilter !== undefined ? options.magFilter : 'Bilinear';
		this.minFilter = options.minFilter !== undefined ? options.minFilter : 'BilinearNoMipMaps';

		this.anisotropy = options.anisotropy !== undefined ? options.anisotropy : 1;

		this.format = options.format !== undefined ? options.format : 'RGBA';
		this.type = options.type !== undefined ? options.type : 'UnsignedByte';
		this.variant = '2D'; // CUBE

		this.offset = new Vector2(0, 0);
		this.repeat = new Vector2(1, 1);

		this.generateMipmaps = options.generateMipmaps !== undefined ? options.generateMipmaps : false;
		this.premultiplyAlpha = options.premultiplyAlpha !== undefined ? options.premultiplyAlpha : false;
		this.unpackAlignment = options.unpackAlignment !== undefined ? options.unpackAlignment : 1;
		this.flipY = options.flipY !== undefined ? options.flipY : true;

		this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
		this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;
	}

	RenderTarget.prototype.clone = function () {
		var tmp = new RenderTarget(this.width, this.height);

		tmp.wrapS = this.wrapS;
		tmp.wrapT = this.wrapT;

		tmp.magFilter = this.magFilter;
		tmp.minFilter = this.minFilter;

		tmp.anisotropy = this.anisotropy;

		tmp.format = this.format;
		tmp.type = this.type;
		tmp.variant = this.variant;

		tmp.offset.copy(this.offset);
		tmp.repeat.copy(this.repeat);

		tmp.generateMipmaps = this.generateMipmaps;
		tmp.premultiplyAlpha = this.premultiplyAlpha;
		tmp.unpackAlignment = this.unpackAlignment;
		tmp.flipY = this.flipY;

		tmp.depthBuffer = this.depthBuffer;
		tmp.stencilBuffer = this.stencilBuffer;

		return tmp;
	};

	return RenderTarget;
});