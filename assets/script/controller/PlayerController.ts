import { _decorator, Component, Node, Vec3, Animation, SkeletalAnimation, tween, RigidBody, Collider, ITriggerEvent, Tween } from 'cc';
import { PathList } from '../item/PathList';
import { PointNode } from '../item/PointNode';
import { PointType } from '../item/PointType';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property({ type: PathList })
    private pathList: PathList[] = [];
    private isFindingPath: boolean = false;
    private selectedPath: PathList;
    private pointCount: number = 0;
    @property(SkeletalAnimation)
    private animator: SkeletalAnimation | null = null;
    @property(RigidBody)
    private rigidBody: RigidBody
    @property(Collider)
    private collider: Collider;
    private isOver: boolean = false;
    start() {
        //di chuyen theo cac diem trong path list
        this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this.scheduleOnce(() => {
            this.findPath();
        }, 1);
    }
    private onTriggerEnter(event: ITriggerEvent) {
        if (this.isOver) return;
        //
        let collisionNode: Node = event.otherCollider.node;
        if(collisionNode.name=='enemy'){
            this.isOver=true;
            console.log('die');
            //stop tween hien tai
            Tween.stopAllByTarget(this.node);
            this.animator.play('die');
  
        }
    }
    //FindPath
    public findPath() {
        //lap qua path list de tim duong
        //
        if(this.isOver) return;
        //neu dang tim duong roi thi khong check tiep
        if (this.isFindingPath) return;
        this.isFindingPath = true;
        //neu dang tim duong roi thi check tiep
        //

        //
        //loop qua toan bo cac duong di
        for (let i = 0; i < this.pathList.length; i++) {
            //lay ra 1 duong di va check xem co the di duoc hay khong
            let pList: PathList = this.pathList[i];
            if (pList && this.isPointUnlock(pList)) {
                this.selectedPath = pList;
                this.isFindingPath = true;
                return this.followPath();
            } else {

                this.isFindingPath = false;
            }
        }

    }
    private isPointUnlock(pointList: PathList) {
        //check 1st point of path
        if (!pointList.getPointList()[0].getIsLock()) {
            return true;
        }
        return false;
    }
    //
    private followPath() {
        console.log('follow path');
        //check path 0
        this.checkPoint();
    }
    private checkPoint() {
        if(this.isOver) return;
        this.checkPointAndMove(this.selectedPath.getPointList()[this.pointCount]);
    }
    //
    private convertPositionToPlayerY(playerPos, pointPos) {
        return new Vec3(pointPos.x, playerPos.y, 0);
    }
    //
    private checkPointAndMove(pointNode: PointNode) {
        if (pointNode == null) {
            //end of way
            //khi khong tim duoc duong thi set lai

            this.isFindingPath = false
            //reset lai point
            this.pointCount = 0;
            return;
        }
        //point dang lock
        if (pointNode.getIsLock()) {
            this.isFindingPath = false
            return;
        };
        //
        let pointType = pointNode.getPointType();
        switch (pointType) {
            case PointType.walk:
                //let desinationPoint: Vec3 = this.convertPositionToPlayerY(this.node.position, pointNode.getPosition())
                this.run(pointNode, () => {
                    this.pointCount++;
                    this.checkPoint();
                });
                break;
            case PointType.jump:
                this.jump(pointNode,()=>{
                    this.pointCount++;
                    this.checkPoint();
                })
                break;

            case PointType.fall:
                this.fall(pointNode, () => {
                    this.pointCount++;
                    this.checkPoint();
                })
                break;

            case PointType.swim:
                this.swim(pointNode, () => {
                    this.pointCount++;
                    this.checkPoint();
                });
                break;
        }
    }
    //
    private run(pointNode: PointNode, finishcallback) {
        //set animation
        let desinationPoint = this.convertPositionToPlayerY(this.node.position,pointNode.getPosition());
        this.animator.play('run');
        //set huong quay mat
        this.node.setRotationFromEuler(pointNode.getDirection())
        tween(this.node).sequence(
            tween(this.node).to(pointNode.getMovingTime(), { worldPosition: desinationPoint }),
            tween(this.node).call(() => {
                this.animator.play('idle')
                //delay 1 khoang 
                this.scheduleOnce(()=>{
                    finishcallback();
                },pointNode.getDelayTime())
            })
        ).start();

    }
    private fall(pointNode: PointNode, finishcallback) {
        //set animation
        this.animator.play('midair');
        this.scheduleOnce(()=>{
            //set animation khi roi xuong mat dat
            this.animator.play('idle');
            //delay 1 khoang de doi di den diem tiep theo
            this.scheduleOnce(()=>{
                finishcallback();
            },pointNode.getDelayTime());
        },pointNode.getMovingTime());
        

    }
    private jump(pointNode: PointNode, finishcallback) {
        this.animator.play('midair');
        this.rigidBody.applyForce(pointNode.getJumpForce());
        this.scheduleOnce(()=>{
            //tra ve animation sau khi nhay xong
            this.animator.play('idle');
            //delay 1 khoang cho den point tiep theo
            this.scheduleOnce(()=>{
                finishcallback();
            },pointNode.getDelayTime())
        },pointNode.getMovingTime())
    }
    private swim(pointNode: PointNode, finishcallback) {
        this.animator.play('swim');
        let desinationPoint = this.convertPositionToPlayerY(this.node.position,pointNode.getPosition());
        tween(this.node).sequence(
            tween(this.node).to(pointNode.getMovingTime(), { worldPosition: desinationPoint }),
            tween(this.node).call(() => {
                finishcallback();
            })
        ).start();
    }
    update(deltaTime: number) {

    }
}


