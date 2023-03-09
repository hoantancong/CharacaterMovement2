import { _decorator ,Node} from 'cc';
import { Configs } from '../../utils/Configs';
import { LevelController } from '../controller/LevelController';
const { ccclass, property } = _decorator;

@ccclass('Level1')
export class Level1 extends LevelController {
    @property(Node)
    private pin:Node | null = null;
    start() {
        //set up parent raycast
        this.setUpRaycastCallback((rayData)=>{
            for(let i = 0; i < rayData.length;i++){
                console.log('ray',rayData[i].collider.node.name);
                this.rayToNode(rayData[i].collider.node)
            }
        })
    }
    //===============LEVEL LOGIC HERE!========================///
    private rayToNode(whichNode:Node){
        if(whichNode.name.includes(Configs.PIN_NAME)){
            this.doWin();
        }
    }
    //===============LEVEL LOGIC HERE!========================///
    private doWin(){
        this.node.destroy();
        this.winGame();
    }
    update(deltaTime: number) {
        
    }
}


