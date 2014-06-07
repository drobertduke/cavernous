var RAND_DEFAULT =
{
  Random: function()
  {
    return Math.random();
  }
};

var PN_GENERATOR =
{
  CreateCanvas: function( inWidth, inHeight )
  {
    var canvas = document.createElement( "canvas" );
    canvas.width = inWidth;
    canvas.height = inHeight;
    return canvas;
  },

  RandomNoise: function( inParameters, inCanvas, inX, inY, inWidth, inHeight, inAlpha )
  {
    var g = inCanvas.getContext("2d"),
      imageData = g.getImageData( 0, 0, inCanvas.width, inCanvas.height ),
      pixels = imageData.data;

    for( var i = 0; i < pixels.length; i += 4 )
    {
      pixels[i] = pixels[i+1] = pixels[i+2] = ( inParameters.alea.Random() * 256 ) | 0;
      pixels[i+3] = 255;
    }

    g.putImageData( imageData, 0, 0 );
    return inCanvas;
  },

  PerlinNoise: function( inParameters )
  {
    /**
     * This part is based on the snippest :
     * https://gist.github.com/donpark/1796361
     */

    var noise = this.RandomNoise( inParameters, PN_GENERATOR.CreateCanvas( inParameters.widthSegments, inParameters.heightSegments ) );
    var context = inParameters.canvas.getContext("2d");

    context.save();

    var ratio = inParameters.widthSegments / inParameters.heightSegments;

    /* Scale random iterations onto the canvas to generate Perlin noise. */
    for( var size = 4; size <= noise.height; size *= inParameters.param )
    {
      var x = ( inParameters.alea.Random() * ( noise.width - size ) ) | 0,
        y = ( inParameters.alea.Random() * ( noise.height - size ) ) | 0;
      context.globalAlpha = 4 / size;
      context.drawImage( noise, Math.max( x, 0 ), y, size * ratio, size, 0, 0, inParameters.widthSegments, inParameters.heightSegments );
    }

    context.restore();

    return inParameters.canvas;
  },

  Get: function( inParameters )
  {
    var geometry = new THREE.Geometry();

    inParameters.param = Math.max( 1.1, inParameters.param );

    // Create the Perlin Noise
    var noise = this.PerlinNoise( inParameters );

    return noise;
  }
};

var BLUR_FILTER =
{
  Apply: function( inCanvas, inParameters )
  {
    boxBlurCanvasRGB( inCanvas, 0, 0, inCanvas.width, inCanvas.height, Math.round(inParameters.filterparam), 2 );
  }
};
var MOUNTAINS_COLORS =
{
  Apply: function( inGeometry, inParameters )
  {
    var step = 1000;

    for( var i = 0; i < inGeometry.faces.length; i+=2 )
    {
      var vertex = inGeometry.vertices[inGeometry.faces[i].a],
        depth = Math.min( 1, 0.2 + ( 0.85 + 0.3 * inParameters.alea.Random() ) * 0.8 * Math.round( step * vertex.y / inParameters.depth ) / step ),
        r = 255 * depth * depth,
        g = 255 * depth,
        b = 255 * depth * depth * depth,
        color = new THREE.Color( (r << 16) + (g << 8) + b );

      inGeometry.faces[i].color = color;
      inGeometry.faces[i+1].color = color;
    }
  },

};
var DESTRUCTURE_EFFECT =
{
  Apply: function( inGeometry, inParameters )
  {
    var densityWidth = inParameters.width / inParameters.widthSegments,
      densityHeight = inParameters.height / inParameters.heightSegments,
      densityDepth = inParameters.depth / 255,
      param = 1;

    for( var i = 1; i < inParameters.widthSegments - 1; ++i )
    {
      for( var j = 1; j < inParameters.heightSegments - 1; ++j )
      {
        var vertex = inGeometry.vertices[j * inParameters.widthSegments + i];

        vertex.x += ( inParameters.alea.Random() - 0.5 ) * densityWidth * param;
        vertex.y += ( inParameters.alea.Random() - 0.5 ) * densityDepth * param;
        vertex.z += ( inParameters.alea.Random() - 0.5 ) * densityHeight * param;
      }
    }
  },

};
