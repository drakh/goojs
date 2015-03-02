require([
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/shapes/Sphere',
	'goo/renderer/MeshData',
	'goo/renderer/bounds/BoundingBox',
	'goo/math/Vector3',
	'lib/V'
], function (
	Material,
	ShaderLib,
	Box,
	Sphere,
	MeshData,
	BoundingBox,
	Vector3,
	V
	) {
	'use strict';

	function buildCustomTriangle(verts) {
		var indices = [];
		indices.push(0, 1, 2);

		var meshData = new MeshData(MeshData.defaultMap([MeshData.POSITION]), 3, indices.length);

		meshData.getAttributeBuffer(MeshData.POSITION).set(verts);
		meshData.getIndexBuffer().set(indices);

		meshData.indexLengths = [3];
		meshData.indexModes = ['Triangles'];

		return meshData;
	}

	var goo = V.initGoo();

	var shape1MeshData = new Sphere();
	var shape2MeshData = buildCustomTriangle([0, 0, 4, 0, 3, 5, 0, 0, 6]);

	// shapes and boundingBox material
	var material1 = new Material(ShaderLib.simpleColored);
	material1.uniforms.color = [0.3, 0.6, 0.9];
	var material2 = new Material(ShaderLib.simpleColored);
	material2.uniforms.color = [0.3, 0.9, 0.6];
	material2.wireframe = true;

	// wrap shapeMeshData-s entities entity
	goo.world.createEntity(shape1MeshData, material1).addToWorld();
	goo.world.createEntity(shape2MeshData, material1).addToWorld();

	// bounding box for shape 1
	var boundingBox1 = new BoundingBox();
	boundingBox1.computeFromPoints(shape1MeshData.dataViews.POSITION);

	// bounding box for shape 2
	var boundingBox2 = new BoundingBox();
	boundingBox2.computeFromPoints(shape2MeshData.dataViews.POSITION);

	// get mergedBoundingBox
	var mergedBoundingBox = boundingBox1.merge(boundingBox2);

	var xSize = mergedBoundingBox.xExtent * 2;
	var ySize = mergedBoundingBox.yExtent * 2;
	var zSize = mergedBoundingBox.zExtent * 2;
	var xCenter = mergedBoundingBox.center.data[0];
	var yCenter = mergedBoundingBox.center.data[1];
	var zCenter = mergedBoundingBox.center.data[2];

	var boxMeshData = new Box(xSize, ySize, zSize);
	goo.world.createEntity(boxMeshData, material2, [xCenter, yCenter, zCenter]).addToWorld();

	// camera
	V.addOrbitCamera(new Vector3(5, Math.PI / 2, 0));

	V.process();
});
