import {Vertex, ColourRGBA} from "./interfaces"

export class SquareClass
{
    public vertices = [
    //  X     Y     Z
        -1.0,  1.0, 0.0, // Top Left
         1.0,  1.0, 0.0, // Top Right   
        -1.0, -1.0, 0.0,  // Bottom Left     
         1.0, -1.0, 0.0, // Bottom Right        
    ];
    public texCoords = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];
}
