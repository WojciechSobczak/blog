#include <vector>
#include <algorithm>

template<typename T>
void bubble_sort(std::vector<T>& vector) {
    if (vector.size() <= 1) {
        return;
    }

    for (size_t iteration = 0; iteration < vector.size() - 1; iteration++) {
        for (size_t index = 0; index < vector.size() - 1 - iteration; index++) {
            if (vector[index] > vector[index + 1]) {
                std::swap(vector[index], vector[index + 1]);
            }
        }
    }
}
