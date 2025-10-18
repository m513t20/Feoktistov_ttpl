import pytest

from plib import Point

@pytest.fixture
def points():
    return Point(0,0), Point(2,2)

class TestPoint:

    def test_creation(self):
        p = Point(1,2)
        assert p.x == 1 and p.y == 2
    
        with pytest.raises(TypeError):
            Point(1.3,'Joe')
    
    def test_add(self, points):
        p1, p2 = points
        assert p2 + p1 == Point(2,2)
        p1 += p2 
        assert p1 == Point(2,2)

    def test_sub(self, points):
        p1, p2 = points
        assert p2 - p1 == Point(2,2)
        assert p1 - p2 == -Point(2,2)
        p1 -= p2 
        assert p1 == -Point(2,2)

    def test_distance_to(self):
        p1 = Point(0,0)
        p2 = Point(2,0)
        assert p1.to(p2) == 2
    
    @pytest.mark.parametrize(
            "p1, p2, distance",
            [(Point(0,0),Point(0,10),10),
             (Point(10,0),Point(0,0),10),
             (Point(0,0),Point(1,1),1.414)]
    )
    def test_distance_all_axis(self, p1, p2, distance):
        assert p1.to(p2) == pytest.approx(distance, 0.1)
    
    def test_json(self):
        p = Point(10,10)
        s = p.to_json()
        p2 = Point.from_json(s)
        assert p == p2

    @pytest.mark.parametrize(
            "p1, res",
            [(Point(0,0), True),
             (Point(10,0), False),
             (Point(0,10), False)]
    )
    def test_center(self, p1, res):
        assert p1.is_center() == res

    def test_str(self):
        p1 = Point(1,5)
        assert str(p1) == "Point(1,5)" 
        assert eval(repr(p1)) == p1
    
    def test_eq(self, points):
        p1,p2 = points
        assert p1 != p2
        assert p1 == Point(0,0)
        try: 
            assert p1 == "Joe"
        except:
            assert True
        
