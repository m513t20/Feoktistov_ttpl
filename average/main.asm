%macro pushd 0
    push rax ; запомнить все
    push rbx
    push rcx
    push rdx
%endmacro

%macro popd 0
    pop rdx ; вспомнить все
    pop rcx
    pop rbx
    pop rax
%endmacro

%macro cout 2
    pushd
    mov rax, 1
    mov rdi, 1
    mov rsi, %1
    mov rdx, %2
    syscall
    popd
%endmacro

%macro dprint 0 ; вывод по десяткам
    push rcx
    mov ecx, 10
    mov rdx, 0
    mov rbx, 0 

_divide:
    xor rdx,rdx
    mov rdx,0
    div ecx
    push rdx
    inc rbx
    cmp rax, 0
    jnz _divide

_digit:
    pop rax
    add al, '0'
    mov [buffer], al
    cout buffer, 1
    dec rbx
    cmp rbx, 0
    jg _digit
    pop rcx
%endmacro

%macro sumx 0; суммируем x
    mov edx, [x]
    mov rcx, 1
_addx:
    add edx, [x + rcx * 4]

    inc rcx
    cmp rcx,  array_len
    jne _addx
%endmacro

%macro subsy 0 ; вычитаем y
    sub edx, [y]
    mov rcx, 1
_suby:
    sub edx, [y + rcx * 4]

    inc rcx
    cmp rcx, array_len
    jne _suby
%endmacro

%macro divide_by_length 0 
    push rcx
    push rdx
    
    mov eax, edx
    mov ecx, array_len
    xor edx, edx   
    div ecx  
    
    dprint
    
    pop rdx
    pop rcx
%endmacro

section .text
global _start

_start:
    sumx
    subsy

    cmp edx, 0
    jge _write

    cout message,1
    not edx
    add edx,1

_write:
    mov eax, edx
    divide_by_length
    xor eax,eax

    cout newline, nlen

end:
    cout newline, nlen
    mov rax, 60
    xor rdi, rdi
    syscall

section .data
        x dd 5, 3, 2, 6, 1, 7, 4
        y dd 0, 10, 1, 9, 2, 8, 5 
        array_len equ ($ - y) / 4

        message db "-"
        len equ $ - message
        newline db 0xA 0xD
        nlen equ $ - newline

section .bss
        buffer resb 1