class Main {
    public static void main(String[] args) {
        int numbers[]={1,2,3,2,1,2,3,2,1,5,1,1,1,1,1};
        int count =0;
        int arr = numbers.length;
        for(int i=0;i<arr;i++){
            if(numbers[i]==1){
                count +=1;
                
            }
        }
    System.out.println(count);
    System.out.println("the length of the arr ="+arr);
        
    }
}