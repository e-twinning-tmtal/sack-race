const racers = [
    document.getElementById("player"),
    document.getElementById("cpu1"),
    document.getElementById("cpu2"),
    document.getElementById("cpu3")
];

const positions = [0,0,0,0];

function update(){
    racers.forEach((racer,index)=>{

        let speed;

        if(index === 0){
            speed = 2;
        }else{
            speed = Math.random() * 2;
        }

        positions[index] += speed;

        racer.style.left =
            `${100 + positions[index]}px`;
    });

    requestAnimationFrame(update);
}

update();

window.addEventListener("keydown",e=>{

    if(e.code === "Space"){
        positions[0] += 25;
    }

});
