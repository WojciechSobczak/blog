
def insertion_sort(vector: list):
    for iteration in range(len(vector)):
        for index in range(iteration, 0, -1):
            if vector[index - 1] < vector[index]:
                vector[index], vector[index - 1] = vector[index - 1], vector[index]
            else:
                break