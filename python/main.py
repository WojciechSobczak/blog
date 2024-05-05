import random
import sorting.bubble_sort
import sorting.insertion_sort


def generate_random_vector(_from: int, to: int, count: int) -> list[int]:
    return [random.randint(_from, to) for _ in range(count)]


def test_bubble_sort():
    vector = generate_random_vector(0, 200, 10)
    vector.sort()

    another_vector = vector.copy()
    sorting.bubble_sort.bubble_sort(another_vector)
    
    print(f"Bubble sort vectors equal: {vector == another_vector}")

def test_insertion_sort():
    vector = generate_random_vector(0, 200, 10)
    vector.sort(reverse=True)

    another_vector = vector.copy()
    sorting.insertion_sort.insertion_sort(another_vector)
    
    print(f"Insertion sort vectors equal: {vector == another_vector}")

def main():
    test_bubble_sort()
    test_insertion_sort()


if __name__ == "__main__":
    main()