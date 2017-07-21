function HSVtoRGB(h:number,s:number,v:number)
{
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h*6);
    f = h * 6 - i;
    p = v * (1-s);
    q = v * (1-f*s);
    t = v*(1-(1-f)*s);
    switch (i % 6) 
    {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

export interface Vertex
{
    x: number;
    y: number;
    z: number;
}

export interface ColourRGBA
{
    r: number;
    g: number;
    b: number;
    a: number;
}

export class DiscClass
{
    public vertices: number[];
    public colours: number[];
    public centreColour: ColourRGBA;
    public radius: number;

    private GenerateTriangleFan(segments: number, radius: number)
    {
        let thetaStep = 2*Math.PI;
        let centreCol = this.centreColour;
        this.vertices = [];
        this.colours = [];
        
        // Centre point
        this.vertices.push(0.0, 0.0, 0.0);
        this.colours.push(centreCol.r, centreCol.g, centreCol.b, centreCol.a);

        let vertex: Vertex = {x:0,y:0,z:0};
        for(let s = 0; s <= segments; s++)
        {
            let theta = s / segments * thetaStep;

            // Find vertex
            vertex.x = Math.cos(theta) * radius;
            vertex.y = Math.sin(theta) * radius;
            vertex.z = 0.0;
            this.vertices.push(vertex.x, vertex.y, vertex.z);

            // Calculate colour
            let rgb = HSVtoRGB(s/segments+1, 1, 1);
            this.colours.push(rgb.r/255, rgb.g/255, rgb.b/255, 1.0);
        }
    }

    public UpdateCentreColour(centreCol: ColourRGBA)
    {
        this.centreColour = centreCol;
        this.colours[0] = centreCol.r;
        this.colours[1] = centreCol.g;
        this.colours[2] = centreCol.b;
        this.colours[3] = centreCol.a;
    }
    
    constructor(segments: number, radius: number, centreCol: ColourRGBA)
    {
        this.radius = radius;
        this.centreColour = centreCol;
        this.GenerateTriangleFan(segments, radius);
    }
}
