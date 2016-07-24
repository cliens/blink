# blink
blink is a funny library, use for simulation of typing effect

![image](https://github.com/cliens/blink/blob/master/blinkExapmle.gif )

## Introduction
```
 blink is a funny library, use for simulation of typing effect.
 Now, you can showing a typing effect using the method of it.
 And in the future, we will add the function what you can use it to record your type, and then show it in you site.
```

## usage

```
    blink({auto: true})
            .type('This is a example of blink.you are typing……')
            .delay(3000)
            .type('   hum……')
            .delay(3000)
            .enter()
            .type('Hi, we will going.')
            .enter()
            .type('Now i am typing in the third line. and type two blank[')
            .delay(2000)
            .space(2)
            .type(']. type one tab[')
            .tab()
            .type('].')
            .delay(5000)
            .enter(3)
            .type('Ok, Thanks!')
            .delay(1000)
            .done()
            .run()

```

### License
MIT. © 2016 cliens
