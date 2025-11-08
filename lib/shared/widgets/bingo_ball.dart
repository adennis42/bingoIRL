import 'package:flutter/material.dart';
import '../../core/constants/bingo_colors.dart';
import 'dart:math' as math;

/// Animated Bingo Ball Widget
class BingoBall extends StatefulWidget {
  final String number; // Format: "B7", "I23", etc.
  final double size;
  final bool showLetter;

  const BingoBall({
    super.key,
    required this.number,
    this.size = 150,
    this.showLetter = true,
  });

  @override
  State<BingoBall> createState() => _BingoBallState();
}

class _BingoBallState extends State<BingoBall>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _rotationAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _rotationAnimation = Tween<double>(
      begin: 0,
      end: 2 * math.pi,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOutCubic,
    ));
    
    // Start animation when widget is created
    _controller.forward();
  }

  @override
  void didUpdateWidget(BingoBall oldWidget) {
    super.didUpdateWidget(oldWidget);
    // If number changed and we're using the same widget instance, animate
    if (oldWidget.number != widget.number && mounted) {
      _controller.reset();
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final columnLetter = widget.number[0];
    final numberOnly = widget.number.substring(1);

    return AnimatedBuilder(
      animation: _rotationAnimation,
      builder: (context, child) {
        return Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.001) // Perspective
            ..rotateY(_rotationAnimation.value),
          child: Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  Colors.white,
                  BingoColors.getColumnColor(columnLetter).withValues(alpha: 0.2),
                  BingoColors.getColumnColor(columnLetter).withValues(alpha: 0.4),
                ],
                stops: const [0.0, 0.6, 1.0],
              ),
              boxShadow: [
                BoxShadow(
                  color: BingoColors.getColumnColor(columnLetter).withValues(alpha: 0.5),
                  blurRadius: 25,
                  spreadRadius: 3,
                  offset: const Offset(0, 10),
                ),
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
                // Highlight for 3D effect
                BoxShadow(
                  color: Colors.white.withValues(alpha: 0.6),
                  blurRadius: 8,
                  spreadRadius: -2,
                  offset: const Offset(-3, -3),
                ),
              ],
              border: Border.all(
                color: BingoColors.getColumnBorderColor(columnLetter),
                width: 4,
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white.withValues(alpha: 0.3),
                    Colors.transparent,
                  ],
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (widget.showLetter)
                    Text(
                      columnLetter,
                      style: TextStyle(
                        fontSize: widget.size * 0.22,
                        fontWeight: FontWeight.bold,
                        color: BingoColors.getColumnColor(columnLetter),
                        height: 0.9,
                        letterSpacing: 1,
                      ),
                    ),
                  Text(
                    numberOnly,
                    style: TextStyle(
                      fontSize: widget.size * 0.45,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                      shadows: [
                        Shadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 2,
                          offset: const Offset(1, 1),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

/// Large Bingo Ball Display for Last Called Number
class BingoBallDisplay extends StatelessWidget {
  final String? number;
  final String label;

  const BingoBallDisplay({
    super.key,
    this.number,
    this.label = 'Last Called',
  });

  @override
  Widget build(BuildContext context) {
    if (number == null) {
      return const SizedBox.shrink();
    }

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 24),
            // Use key based on number to ensure animation triggers on number change
            BingoBall(
              key: ValueKey(number),
              number: number!,
              size: 180,
              showLetter: true,
            ),
          ],
        ),
      ),
    );
  }
}

