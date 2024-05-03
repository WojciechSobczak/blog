


def bubble_sort(vector: list):
    for iteration in range(len(vector) - 1):
        for index in range(len(vector) - 1 - iteration):
            if vector[index] > vector[index + 1]:
                vector[index], vector[index + 1] = vector[index + 1], vector[index]
