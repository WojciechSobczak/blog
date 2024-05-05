#include <random>
#include <fmt/format.h>
#include "sorting/bubble_sort.hpp"
#include "sorting/insertion_sort.hpp"

std::vector<uint64_t> generate_random_vector(uint64_t from, uint64_t to, size_t count) {
    std::random_device device;
    std::mt19937 engine(device());
    std::uniform_int_distribution<std::mt19937::result_type> distribution(from,to);

    std::vector<uint64_t> output;
    for (size_t i = 0; i < count; i++) {
        output.push_back(distribution(engine));
    }
    return output;
}


void test_bubble_sort() {
    auto vector = generate_random_vector(0, 200, 10);
    auto another_vector = vector;

    std::sort(std::begin(vector), std::end(vector));
    bubble_sort(another_vector);

    fmt::println("Bubble sort vectors equal: {}", vector == another_vector);
}

void test_insertion_sort() {
    auto vector = generate_random_vector(0, 200, 10);
    auto another_vector = vector;

    std::sort(std::begin(vector), std::end(vector), [](auto& a, auto& b) { return a > b;});
    insertion_sort(another_vector);

    fmt::println("Insertion sort vectors equal: {}", vector == another_vector);
}


int main() {
    test_bubble_sort();
    test_insertion_sort();
}
